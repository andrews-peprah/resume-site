---
title: "Self-Hosting My Own Private Network with Headscale and Tailscale"
date: 2026-06-25
description: "How I built a private mesh between a home server and a VPS using Headscale, a custom DERP relay, and Nginx Proxy Manager — and the kernel-networking gotcha that cost me an afternoon."
slug: self-hosting-tailscale-headscale
---

I wanted to expose a few services running on a machine at home — this very blog, for one — to the public internet, **without** opening a single inbound port on my home router. The usual answer is Tailscale, and it's excellent. But I also wanted to own the control plane end to end, so I ran [**Headscale**](https://github.com/juanfont/headscale) — the open-source implementation of Tailscale's coordination server — on a small VPS.

This post is the architecture I landed on, and more usefully, the three traps I fell into along the way. If you're wiring up the same stack, the "Lessons" section is the part worth reading.

## The goal

```
            Internet
                │  (HTTPS, 443)
                ▼
        ┌───────────────┐
        │      VPS       │   Nginx Proxy Manager  ── TLS termination
        │               │   Headscale            ── control plane
        │               │   DERP relay           ── NAT traversal
        │               │   Tailscale (gateway)  ── joins its own tailnet
        └───────┬───────┘
                │  WireGuard / DERP  (private mesh, 100.64.0.0/10)
                ▼
        ┌───────────────┐
        │  Home server  │   Tailscale node + WordPress/Rails/etc.
        └───────────────┘
```

Public traffic hits the VPS, terminates TLS at the reverse proxy, and is forwarded **across the private mesh** to whatever's running at home. The home machine never exposes a port to the internet — it only ever speaks to the tailnet.

## The pieces

Everything runs in Docker Compose. On the VPS:

- **Headscale** — the coordination server. Hands out `100.64.x.y` addresses and brokers WireGuard keys. This is the brain; if it's down, nothing can authenticate.
- **Headplane** — a clean web UI for Headscale (managing users, nodes, pre-auth keys).
- **A self-hosted DERP relay** — Tailscale's relays are used when two nodes can't reach each other directly (e.g. both behind strict NAT). Running my own means zero dependency on Tailscale's infrastructure.
- **Nginx Proxy Manager (NPM)** — terminates TLS (Let's Encrypt) and reverse-proxies each subdomain to the right upstream.
- **A Tailscale node** — the VPS itself joins the tailnet as a gateway so the proxy can reach home services.

On the home server: a Tailscale node, plus the actual apps sharing its network namespace.

## How a request flows

1. A visitor loads `blog.example.com`. DNS points at the VPS.
2. NPM accepts the HTTPS connection, terminates TLS, and proxies to the home node's tailnet IP (`100.64.0.2`) on the app's port.
3. That request travels over WireGuard (or via the DERP relay) to the home server.
4. The app responds, back along the same path.

Clean in theory. Here's where reality bit.

## Lesson 1 — A reverse proxy returns 502 when it can't reach its *upstream*, not when the app is down

The very first symptom was that none of my Tailscale clients could log in. The control server was returning `502 Bad Gateway` for every request to `/key`. My instinct was that Headscale had crashed.

It hadn't. Headscale was healthy and answering on `localhost:8080` the whole time. The problem was one wrong number in the reverse proxy: the proxy host for the control-plane domain was forwarding to the Headscale **container on port 3000** — which is the *Headplane UI* port — instead of `8080`, the control API. Nothing was listening on `3000` in that container, so the proxy had no upstream and returned 502.

> **Takeaway:** A 502 means "I, the proxy, could not get a valid response from the thing I forward to." Before you debug the app, prove the upstream is reachable *from the proxy's own perspective* — `curl` it directly on its real host and port.

## Lesson 2 — In userspace mode, a service isn't reachable at the tailnet IP. Use the kernel TUN.

With the control plane fixed, the home app still wasn't reachable across the mesh. The VPS could `tailscale ping` the home node fine — but an actual TCP connection to its web port timed out.

The cause: the official Tailscale container defaults to **`--tun=userspace-networking`**. In that mode there's no real network interface — Tailscale carries traffic through an in-process stack. A `tailscale ping` works (that's Tailscale's own machinery), but a normal app bound to `0.0.0.0:80` is **not** automatically reachable at the node's `100.64.x.y` address. You'd have to expose it explicitly with `tailscale serve`, which on a self-hosted control server is finicky.

The fix was to give the container a real kernel interface. It already had `/dev/net/tun` mounted and the right capabilities, so it just needed the flag:

```yaml
services:
  tailscale:
    image: tailscale/tailscale:latest
    environment:
      - TS_USERSPACE=false        # create a real tailscale0 interface
    cap_add: [NET_ADMIN, SYS_MODULE]
    volumes:
      - /dev/net/tun:/dev/net/tun
```

With `TS_USERSPACE=false`, a `tailscale0` interface appears holding `100.64.x.y`, and any service listening on `0.0.0.0` is instantly reachable at that address — no `serve` gymnastics. On the VPS gateway (running host networking) the same flag puts a `tailscale0` on the host itself, so the reverse proxy can route into the mesh.

> **Takeaway:** `tailscale ping` succeeding does **not** prove a normal TCP client can connect. If apps need to bind the tailnet IP directly, run the node in kernel mode.

## Lesson 3 — `network_mode: service:x` dependents must be *recreated*, not restarted

To put my app "behind" Tailscale, I ran it in the Tailscale container's network namespace:

```yaml
  app:
    network_mode: "service:tailscale"
    depends_on: [tailscale]
```

This is the canonical pattern, and it works — until the Tailscale container restarts. When that happens (and during the control-plane outage above, mine crash-looped *over a hundred times*), Docker does **not** restart the dependents. They're left attached to a network namespace that no longer exists. The app keeps running, blissfully serving on a dead interface that nothing can reach.

Worse: `docker restart app` fails too, because it tries to rejoin the *old* container's namespace by ID:

```
Error response from daemon: cannot join network namespace of container ...: No such container
```

The fix is to **recreate** the dependents so they re-resolve to the new namespace:

```bash
docker compose up -d app      # recreate, don't `restart`
```

> **Takeaway:** `depends_on` controls start order, not restart coupling. Any time the namespace-owner restarts, bring its dependents back up with `compose up -d` (or automate it with a healthcheck + an auto-heal sidecar).

## The meta-lesson: monitor the control plane

The whole cascade started because Headscale silently returned 502s for ~two days before I noticed. A trivial uptime check against the control server's `/health` endpoint would have caught it in minutes instead of after a hundred restart loops. Self-hosting means *you* are the SRE — so give yourself the alerts you'd expect at work.

## Was it worth it?

Absolutely. I now have a private mesh I fully control, home services exposed to the world with TLS and zero open home ports, and no third-party coordination server in the path. This very page is served from a machine sitting on my desk, reached over WireGuard, proxied through a VPS I rent for a few dollars a month.

And I learned more about Linux networking namespaces in one afternoon of debugging than in a year of everything-just-working. That's the trade, and I'll take it.

# Docs

## How to

### Coolify

On Coolify, create Git App with docker-compose buildpack. Configure environment variables from Advanced tab. Coolify will auto re-deploy on commit.

### Local

To test locally:

- create a .env.local file
- create a copy of docker-compose.yaml (include .env.local in it)
- copy environment variables from the original compose file to the local copy
- run:
  `docker compose -f docker-compose.local.yaml build`
  `docker compose -f docker-compose.local.yaml up`

## Trouble-shooting

### Docker container works locally, but throws build error on Coolify

Try disabling Coolify build cache (Advanced tab). If that doesn't work, create a new app. Also, an npm build error might be the case, check the Logs tab on Coolify.

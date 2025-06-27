// components/games/oc-code-quest/constants.ts

export const CANVAS_WIDTH = 1000
export const CANVAS_HEIGHT = 600

export const SHIP_WIDTH = 40
export const SHIP_HEIGHT = 30
export const SHIP_SPEED = 5

export const TOKEN_RADIUS = 15
export const TOKEN_SPEED = 3
export const TOKEN_SPAWN_INTERVAL = 2000 // ms

export const ocFacts = [
  "OCID Connect follows the OIDC Auth Code Flow with PKCE.",
  "Redirect URIs must be registered in your Open Campus Developer account.",
  "Sandbox mode allows testing without a clientId.",
  "Educhain leverages blockchain for decentralized identity.",
  "OpenCampus empowers learning with secure, user-friendly authentication.",
  "Decentralization removes single points of failure.",
  "Smart contracts are self-executing once conditions are met.",
] as const

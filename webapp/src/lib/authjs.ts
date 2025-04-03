
import { SvelteKitAuth } from "@auth/sveltekit"
import GitHub from "@auth/sveltekit/providers/github"

export const authjs = SvelteKitAuth({
    providers: [GitHub],
})


import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

// Type definition for a configured MCP server
export interface MCPServerConfig {
    name: string;
    url: string;
    enabled: boolean;
    weight: number; // 0-100
}

export interface SourceContext {
    sourceName: string;
    sourceType: 'MCP' | 'Local' | 'System';
    content: string;
    weight: number;
    uri?: string;
}

export class MCPClientManager {
    private static instance: MCPClientManager;
    private clients: Map<string, Client> = new Map();

    private constructor() { }

    public static getInstance(): MCPClientManager {
        if (!MCPClientManager.instance) {
            MCPClientManager.instance = new MCPClientManager();
        }
        return MCPClientManager.instance;
    }

    /**
     * Connects to a specific SSE MCP Server.
     * Note: Browser-based connections require the server to support SSE.
     */
    public async connectToServer(url: string, timeoutMs: number = 15000): Promise<Client> {
        if (this.clients.has(url)) {
            const existing = this.clients.get(url)!;
            // If we have a client, we should verified it's actually connected? 
            // The SDK doesn't expose a simple 'isConnected' check easily without trying to use it.
            // For now, if we have it, return it.
            return existing;
        }

        // In a real browser implementation, you'd handle potentially multiple transports.
        // Here we strictly use SSEClientTransport which relies on browser EventSource.
        const transport = new SSEClientTransport(new URL(url));
        const client = new Client(
            {
                name: "thermal-hubble-client",
                version: "1.0.0",
            },
            {
                capabilities: {},
            }
        );

        try {
            // Race the connection against a timeout
            await Promise.race([
                client.connect(transport),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error(`Connection timed out after ${timeoutMs}ms`)), timeoutMs)
                )
            ]);

            this.clients.set(url, client);
            console.log(`[MCP] Connected to ${url}`);
            return client;
        } catch (err: any) {
            console.error(`[MCP] Failed to connect to ${url}`, err);
            // Ensure we clean up if it failed halfway
            try { await client.close(); } catch { }

            // Return a clean error message
            if (err.message && err.message.includes("timed out")) {
                throw new Error("Connection timed out. The server is not responding.");
            }
            if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
                throw new Error("Connection refused. Is the server running and CORS enabled?");
            }

            throw err;
        }
    }



    /**
     * Fetches context from all enabled MCP servers stored in localStorage.
     * Returns structured SourceContext objects.
     */
    public async fetchContextFromServers(): Promise<SourceContext[]> {
        const configsStr = localStorage.getItem('mcp_servers');
        if (!configsStr) return [];

        const configs: MCPServerConfig[] = JSON.parse(configsStr);
        const enabledServers = configs.filter(c => c.enabled);

        if (enabledServers.length === 0) return [];

        const contexts: SourceContext[] = [];

        await Promise.all(enabledServers.map(async (server) => {
            try {
                console.log(`[MCP] Fetching context from ${server.name}...`);
                const client = await this.connectToServer(server.url);

                // list resources
                const { resources } = await client.listResources();

                for (const resource of resources) {
                    // read each resource content
                    const contentResult = await client.readResource({ uri: resource.uri });

                    for (const content of contentResult.contents) {
                        let textContent = "";
                        if ('text' in content) {
                            textContent = content.text;
                        } else {
                            textContent = `[Binary data: ${content.mimeType}]`;
                        }

                        contexts.push({
                            sourceName: `${server.name} (${resource.name})`,
                            sourceType: 'MCP',
                            content: textContent,
                            weight: server.weight,
                            uri: resource.uri
                        });
                    }
                }

            } catch (err) {
                console.warn(`[MCP] Could not fetch from ${server.name}:`, err);
                // Optionally push an error context so the UI knows something failed?
                // For now, we'll just log it. 
            }
        }));

        return contexts;
    }
}

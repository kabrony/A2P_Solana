import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import bs58 from 'bs58';
import { v4 as uuidv4 } from 'uuid';

// Agent interface
interface Agent {
  id: string;
  name: string;
  capabilities: string[];
  balance: number;
  publicKey: string;
  createdAt: Date;
  updatedAt: Date;
}

// Agent store (in-memory for demo)
class AgentStore {
  private agents: Map<string, Agent> = new Map();

  createAgent(name: string, capabilities: string[], initialBalance: number): Agent {
    const agent: Agent = {
      id: uuidv4(),
      name,
      capabilities,
      balance: initialBalance,
      publicKey: PublicKey.unique().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.agents.set(agent.id, agent);
    return agent;
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  updateAgentBalance(id: string, newBalance: number): boolean {
    const agent = this.agents.get(id);
    if (agent) {
      agent.balance = newBalance;
      agent.updatedAt = new Date();
      return true;
    }
    return false;
  }

  transferFunds(fromId: string, toId: string, amount: number): boolean {
    const fromAgent = this.agents.get(fromId);
    const toAgent = this.agents.get(toId);
    
    if (!fromAgent || !toAgent || fromAgent.balance < amount) {
      return false;
    }
    
    fromAgent.balance -= amount;
    fromAgent.updatedAt = new Date();
    
    toAgent.balance += amount;
    toAgent.updatedAt = new Date();
    
    return true;
  }
}

// Zod schemas for validation
const CreateAgentSchema = z.object({
  name: z.string().min(1, 'Agent name is required'),
  capabilities: z.array(z.string()).min(1, 'At least one capability is required'),
  initialBalance: z.number().min(0, 'Initial balance must be non-negative'),
});

const TransferFundsSchema = z.object({
  fromAgentId: z.string().min(1, 'From agent ID is required'),
  toAgentId: z.string().min(1, 'To agent ID is required'),
  amount: z.number().positive('Amount must be positive'),
  message: z.string().optional(),
});

const GetBalanceSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
});

class SimpleA2PMCPServer {
  private server: Server;
  private agentStore: AgentStore;
  private connection: Connection;

  constructor() {
    this.server = new Server(
      {
        name: 'A2P Protocol MCP Server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.agentStore = new AgentStore();
    
    // Initialize Solana connection
    const network = process.env.A2P_NETWORK || 'mainnet-beta';
    const rpcUrl = process.env.A2P_RPC_URL || clusterApiUrl(network);
    this.connection = new Connection(rpcUrl, 'confirmed');
    
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'a2p_create_agent',
            description: 'Create a new A2P agent with specified capabilities and initial balance',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the agent',
                },
                capabilities: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Array of agent capabilities',
                },
                initialBalance: {
                  type: 'number',
                  description: 'Initial SOL balance for the agent',
                },
              },
              required: ['name', 'capabilities', 'initialBalance'],
            },
          },
          {
            name: 'a2p_list_agents',
            description: 'List all active A2P agents with their status and capabilities',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'a2p_transfer_funds',
            description: 'Transfer SOL between A2P agents',
            inputSchema: {
              type: 'object',
              properties: {
                fromAgentId: {
                  type: 'string',
                  description: 'ID of the source agent',
                },
                toAgentId: {
                  type: 'string',
                  description: 'ID of the destination agent',
                },
                amount: {
                  type: 'number',
                  description: 'Amount of SOL to transfer',
                },
                message: {
                  type: 'string',
                  description: 'Optional message for the transfer',
                },
              },
              required: ['fromAgentId', 'toAgentId', 'amount'],
            },
          },
          {
            name: 'a2p_get_balance',
            description: 'Get the SOL balance for a specific A2P agent',
            inputSchema: {
              type: 'object',
              properties: {
                agentId: {
                  type: 'string',
                  description: 'ID of the agent',
                },
              },
              required: ['agentId'],
            },
          },
          {
            name: 'a2p_health_check',
            description: 'Perform system health check and get network information',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'a2p_create_agent':
            return await this.handleCreateAgent(args);
          case 'a2p_list_agents':
            return await this.handleListAgents();
          case 'a2p_transfer_funds':
            return await this.handleTransferFunds(args);
          case 'a2p_get_balance':
            return await this.handleGetBalance(args);
          case 'a2p_health_check':
            return await this.handleHealthCheck();
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleCreateAgent(args: any): Promise<any> {
    const validated = CreateAgentSchema.parse(args);
    
    const agent = this.agentStore.createAgent(
      validated.name,
      validated.capabilities,
      validated.initialBalance
    );
    
    return {
      content: [
        {
          type: 'text',
          text: `Agent created successfully:\nID: ${agent.id}\nName: ${agent.name}\nCapabilities: ${agent.capabilities.join(', ')}\nInitial Balance: ${agent.balance} SOL\nPublic Key: ${agent.publicKey}\nCreated At: ${agent.createdAt.toISOString()}`,
        },
      ],
    };
  }

  private async handleListAgents(): Promise<any> {
    const agents = this.agentStore.getAllAgents();
    
    if (agents.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No agents found. Create an agent using the a2p_create_agent tool.',
          },
        ],
      };
    }
    
    const agentList = agents
      .map(
        (agent) =>
          `ID: ${agent.id}\nName: ${agent.name}\nCapabilities: ${agent.capabilities.join(', ')}\nBalance: ${agent.balance} SOL\nCreated: ${agent.createdAt.toISOString()}`
      )
      .join('\n\n');
    
    return {
      content: [
        {
          type: 'text',
          text: `Active Agents (${agents.length}):\n\n${agentList}`,
        },
      ],
    };
  }

  private async handleTransferFunds(args: any): Promise<any> {
    const validated = TransferFundsSchema.parse(args);
    
    const success = this.agentStore.transferFunds(
      validated.fromAgentId,
      validated.toAgentId,
      validated.amount
    );
    
    if (!success) {
      return {
        content: [
          {
            type: 'text',
            text: 'Transfer failed. Please check:\n- Both agent IDs are valid\n- Source agent has sufficient balance\n- Amount is positive',
          },
        ],
        isError: true,
      };
    }
    
    const fromAgent = this.agentStore.getAgent(validated.fromAgentId);
    const toAgent = this.agentStore.getAgent(validated.toAgentId);
    
    const message = validated.message ? `\nMessage: ${validated.message}` : '';
    
    return {
      content: [
        {
          type: 'text',
          text: `Transfer successful!\nFrom: ${fromAgent?.name} (${validated.fromAgentId})\nTo: ${toAgent?.name} (${validated.toAgentId})\nAmount: ${validated.amount} SOL\nFrom Agent Balance: ${fromAgent?.balance} SOL\nTo Agent Balance: ${toAgent?.balance} SOL${message}`,
        },
      ],
    };
  }

  private async handleGetBalance(args: any): Promise<any> {
    const validated = GetBalanceSchema.parse(args);
    
    const agent = this.agentStore.getAgent(validated.agentId);
    
    if (!agent) {
      return {
        content: [
          {
            type: 'text',
            text: `Agent with ID '${validated.agentId}' not found.`,
          },
        ],
        isError: true,
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Agent Balance:\nID: ${agent.id}\nName: ${agent.name}\nBalance: ${agent.balance} SOL\nPublic Key: ${agent.publicKey}\nLast Updated: ${agent.updatedAt.toISOString()}`,
        },
      ],
    };
  }

  private async handleHealthCheck(): Promise<any> {
    try {
      // Check Solana connection
      const slot = await this.connection.getSlot();
      const blockTime = await this.connection.getBlockTime(slot);
      
      // Get agent statistics
      const agents = this.agentStore.getAllAgents();
      const totalBalance = agents.reduce((sum, agent) => sum + agent.balance, 0);
      
      return {
        content: [
          {
            type: 'text',
            text: `A2P Protocol Health Check:\n\nSystem Status: ✅ Healthy\nNetwork: ${process.env.A2P_NETWORK || 'mainnet-beta'}\nCurrent Slot: ${slot}\nBlock Time: ${blockTime ? new Date(blockTime * 1000).toISOString() : 'N/A'}\n\nAgent Statistics:\nTotal Agents: ${agents.length}\nTotal Balance: ${totalBalance} SOL\nAverage Balance: ${agents.length > 0 ? (totalBalance / agents.length).toFixed(6) : 0} SOL\n\nMCP Server: ✅ Running\nVersion: 1.0.0\nTools Available: 5\n\nAll systems operational!`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Health Check Failed:\nStatus: ❌ Unhealthy\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check:\n- Network connectivity\n- RPC endpoint status\n- Environment variables`,
          },
        ],
        isError: true,
      };
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('A2P Protocol MCP Server started successfully');
  }
}

// Start the server
const server = new SimpleA2PMCPServer();
server.run().catch(console.error);

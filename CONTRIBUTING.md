# Contributing to A2P Protocol MCP Service

Thank you for your interest in contributing to the A2P Protocol MCP Service! We welcome all forms of contribution, including bug reports, feature requests, documentation improvements, and code contributions.

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [How to Contribute](#-how-to-contribute)
- [Development Guidelines](#-development-guidelines)
- [Testing Guidelines](#-testing-guidelines)
- [Documentation Guidelines](#-documentation-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Release Process](#-release-process)

## 🤝 Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code.

Please report unacceptable behavior to [kabrony@tuyamail.com](mailto:kabrony@tuyamail.com).

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0
- Git
- TypeScript knowledge
- Solana blockchain basics

### Setup

```bash
# Clone the repository
git clone https://github.com/kabrony/A2P_Solana.git
cd A2P_Solana

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development server
npm run dev
```

### Environment Setup

```bash
# Copy environment template
cp .env.template .env

# Edit environment variables
nano .env
```

Required environment variables:
```bash
A2P_NETWORK=mainnet-beta
A2P_RPC_URL=https://api.mainnet-beta.solana.com
```

## 🤔 How to Contribute

### 1. Reporting Bugs

- Use the [GitHub Issues](https://github.com/kabrony/A2P_Solana/issues) page
- Use the "Bug Report" template
- Provide detailed information including:
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - Environment details
  - Error messages
  - Screenshots (if applicable)

### 2. Suggesting Features

- Use the [GitHub Issues](https://github.com/kabrony/A2P_Solana/issues) page
- Use the "Feature Request" template
- Provide detailed information including:
  - Problem description
  - Proposed solution
  - Alternative solutions
  - Use cases
  - Implementation ideas (if any)

### 3. Contributing Code

#### Fork and Clone

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/A2P_Solana.git
cd A2P_Solana

# Add upstream remote
git remote add upstream https://github.com/kabrony/A2P_Solana.git
```

#### Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or create a bugfix branch
git checkout -b bugfix/your-bugfix-name
```

#### Make Changes

- Follow the [Development Guidelines](#-development-guidelines)
- Write tests for new functionality
- Update documentation
- Ensure all tests pass

#### Commit Changes

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat: add new agent capability"
```

#### Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create a pull request on GitHub
```

### 4. Improving Documentation

- Documentation is as important as code
- Fix typos and grammatical errors
- Add examples and use cases
- Improve API documentation
- Update README and guides

### 5. Helping with Issues

- Reproduce reported bugs
- Provide additional information
- Suggest solutions
- Review pull requests
- Answer questions in discussions

## 💻 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for all public APIs

### TypeScript Guidelines

```typescript
// Good example
/**
 * Creates a new A2P agent with specified capabilities
 * @param config - Agent configuration
 * @returns Promise<Agent> - Created agent instance
 */
export async function createAgent(config: AgentConfig): Promise<Agent> {
  // Implementation
}

// Bad example
function createAgent(c) {
  // Implementation
}
```

### Error Handling

```typescript
// Good example
export async function transferFunds(params: TransferParams): Promise<TransferResult> {
  try {
    // Validate input
    if (!params.fromAgentId || !params.toAgentId) {
      throw new Error('Agent IDs are required');
    }
    
    if (params.amount <= 0) {
      throw new Error('Amount must be positive');
    }
    
    // Execute transfer
    const result = await executeTransfer(params);
    return result;
    
  } catch (error) {
    // Log error for debugging
    logger.error('Transfer failed', { error, params });
    
    // Re-throw with context
    throw new Error(`Transfer failed: ${error.message}`);
  }
}
```

### Security Guidelines

- Never commit sensitive information (keys, passwords, etc.)
- Validate all input parameters
- Use environment variables for configuration
- Implement proper error handling without exposing sensitive data
- Follow Solana security best practices

### Performance Guidelines

- Optimize for Solana network constraints
- Minimize RPC calls
- Use caching where appropriate
- Implement proper connection management
- Monitor memory usage for agent operations

## 🧪 Testing Guidelines

### Test Structure

```
test/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
├── fixtures/      # Test fixtures
└── helpers/       # Test helpers
```

### Writing Tests

```typescript
// Good test example
describe('Agent Creation', () => {
  let client: SimpleA2PClient;
  
  beforeEach(() => {
    client = new SimpleA2PClient();
  });
  
  afterEach(async () => {
    await client.cleanup();
  });
  
  it('should create an agent with valid configuration', async () => {
    const config = {
      name: 'Test Agent',
      capabilities: ['testing'],
      initialBalance: 0.1
    };
    
    const agent = await client.createAgent(config);
    
    expect(agent).toBeDefined();
    expect(agent.name).toBe(config.name);
    expect(agent.capabilities).toEqual(config.capabilities);
    expect(agent.balance).toBe(config.initialBalance);
  });
  
  it('should throw error for invalid agent configuration', async () => {
    const config = {
      name: '', // Invalid: empty name
      capabilities: ['testing'],
      initialBalance: 0.1
    };
    
    await expect(client.createAgent(config))
      .rejects
      .toThrow('Agent name is required');
  });
});
```

### Test Coverage

- Aim for at least 80% test coverage
- Test both success and error scenarios
- Use mocks for external dependencies
- Test edge cases and boundary conditions
- Include integration tests for MCP tools

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📚 Documentation Guidelines

### Code Documentation

```typescript
/**
 * A2P Agent representing an autonomous entity in the system
 * 
 * @class Agent
 * @description Represents an agent with capabilities, balance, and communication abilities
 * @example
 * const agent = await client.createAgent({
 *   name: 'Trading Agent',
 *   capabilities: ['trading', 'analysis'],
 *   initialBalance: 1.0
 * });
 */
export class Agent {
  /**
   * Unique identifier for the agent
   * @type {string}
   */
  public readonly id: string;
  
  /**
   * Agent name for display purposes
   * @type {string}
   */
  public name: string;
  
  /**
   * Array of agent capabilities
   * @type {string[]}
   */
  public capabilities: string[];
  
  /**
   * Current SOL balance
   * @type {number}
   */
  public balance: number;
  
  /**
   * Agent creation timestamp
   * @type {Date}
   */
  public readonly createdAt: Date;
  
  // ... rest of the class
}
```

### README and Guides

- Keep documentation up to date
- Use clear and concise language
- Include code examples
- Provide step-by-step instructions
- Add screenshots where helpful
- Link to related documentation

### API Documentation

- Document all public APIs
- Include parameter types and return types
- Provide usage examples
- Document error cases
- Include performance considerations

## 🔄 Pull Request Process

### Before Submitting

1. **Code Quality**
   - Run `npm run build` to ensure TypeScript compilation
   - Run `npm run lint` to check code style
   - Run `npm test` to ensure all tests pass
   - Run `npm run test:coverage` to check coverage

2. **Documentation**
   - Update JSDoc comments for new/modified functions
   - Update README if needed
   - Add/update examples
   - Update CHANGELOG for significant changes

3. **Testing**
   - Add tests for new functionality
   - Ensure existing tests still pass
   - Add integration tests for new features

### Pull Request Template

```markdown
## Changes

<!-- Describe your changes in detail -->

### Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Security fix
- [ ] Other (please describe)

### Description

<!-- Provide a detailed description of the changes -->

### Related Issues

<!-- Link to related GitHub issues -->
- Closes #123
- References #456

### Testing

<!-- Describe how you tested your changes -->
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing performed
- [ ] Edge cases considered

### Checklist

- [ ] My code follows the project's code style
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules
```

### Review Process

1. **Automated Checks**
   - CI/CD pipeline runs automatically
   - All checks must pass before merge

2. **Peer Review**
   - At least one maintainer must review
   - Address all review comments
   - Update PR as needed

3. **Final Approval**
   - Maintainer approves changes
   - PR is merged to main branch
   - Changes are deployed to production

## 📦 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version when you make incompatible API changes
- **MINOR** version when you add functionality in a backward compatible manner
- **PATCH** version when you make backward compatible bug fixes

### Release Steps

1. **Update Version**
   ```bash
   # Update package.json version
   npm version patch/minor/major
   ```

2. **Update Changelog**
   - Add release notes to CHANGELOG.md
   - Include all significant changes
   - Credit contributors

3. **Create Release**
   ```bash
   # Build and test
   npm run build
   npm test
   
   # Create git tag
   git push --follow-tags
   ```

4. **Publish to npm**
   ```bash
   npm publish
   ```

5. **GitHub Release**
   - Create GitHub release with tag
   - Add release notes
   - Attach binaries if applicable

### Release Checklist

- [ ] Version number updated correctly
- [ ] CHANGELOG.md updated
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Build artifacts generated
- [ ] npm publish successful
- [ ] GitHub release created
- [ ] Release announcement sent

## 🏆 Recognition

### Contributor Recognition

- All contributors are credited in the README
- Significant contributors may be invited to become maintainers
- Contributors are recognized in release notes
- Top contributors receive special recognition in project communications

### Maintainer Responsibilities

- Review pull requests and issues
- Guide contributors and provide feedback
- Make final decisions on project direction
- Ensure code quality and security standards
- Manage releases and deployments
- Mentor new contributors

## 📞 Getting Help

### Resources

- [Documentation](https://github.com/kabrony/A2P_Solana/wiki)
- [API Reference](https://github.com/kabrony/A2P_Solana/wiki/API)
- [Examples](https://github.com/kabrony/A2P_Solana/tree/main/examples)
- [GitHub Issues](https://github.com/kabrony/A2P_Solana/issues)
- [GitHub Discussions](https://github.com/kabrony/A2P_Solana/discussions)

### Contact

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For general questions and discussions
- **Email**: [kabrony@tuyamail.com](mailto:kabrony@tuyamail.com) for private matters

### Community

- Join our [Discord server](https://discord.gg/a2p-protocol) (coming soon)
- Follow us on [Twitter](https://twitter.com/a2p_protocol) (coming soon)
- Subscribe to our [newsletter](https://a2p-protocol.substack.com) (coming soon)

---

**Thank you for contributing to the A2P Protocol MCP Service!** 🎉

Your contributions help make agent-to-agent communication on Solana more accessible and powerful for everyone.

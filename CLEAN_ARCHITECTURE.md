# Clean Architecture Implementation

This project has been refactored to follow Clean Architecture principles, providing better separation of concerns, testability, and maintainability.

## Architecture Overview

The application is organized into the following layers:

### 1. Domain Layer (`src/domain/`)
- **Entities**: Contains business logic and rules
  - `Client.ts`: Core client entity with business rules
- **Repositories**: Interfaces for data access
  - `ClientRepository.ts`: Abstract interface for client data operations

### 2. Application Layer (`src/application/`)
- **Use Cases**: Application-specific business logic
  - `CreateClientUseCase.ts`: Handle client creation
  - `GetAllClientsUseCase.ts`: Retrieve all clients
  - `GetClientByIdUseCase.ts`: Retrieve client by ID
  - `UpdateClientUseCase.ts`: Update client information
  - `DeleteClientUseCase.ts`: Delete client
  - `DepositUseCase.ts`: Handle deposit operations
  - `WithdrawUseCase.ts`: Handle withdrawal operations

### 3. Infrastructure Layer (`src/infrastructure/`)
- **Database**: Database configuration and connection
  - `Database.ts`: Singleton database manager
- **Repositories**: Concrete implementations of repository interfaces
  - `SqliteClientRepository.ts`: SQLite implementation of ClientRepository
- **Container**: Dependency injection container
  - `Container.ts`: Manages dependencies and provides instances

### 4. Presentation Layer (`src/controllers/`, `src/routes/`)
- **Controllers**: Handle HTTP requests and responses
  - `ClientController.ts`: REST API endpoints for client operations
- **Routes**: Define API routes
  - `clientRoutes.ts`: Client-related routes

## Key Benefits

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Testability**: Business logic is isolated and easy to test
3. **Maintainability**: Changes in one layer don't affect others
4. **Flexibility**: Easy to swap implementations (e.g., change database)
5. **Domain-Driven**: Business rules are centralized in the domain layer

## Data Flow

1. **Request**: HTTP request comes through routes
2. **Controller**: Handles request, delegates to use cases
3. **Use Case**: Executes business logic using domain entities
4. **Repository**: Abstracts data access from business logic
5. **Database**: Persists data through infrastructure layer

## Business Rules

The `Client` entity enforces several business rules:
- Name and email validation
- Positive deposit amounts
- Sufficient balance for withdrawals
- Unique email addresses

## Dependency Injection

The `Container` class manages all dependencies using the Singleton pattern, ensuring consistent instances across the application.

## Error Handling

- Domain-level validation errors
- Use case-level business logic errors
- Infrastructure-level database errors
- Presentation-level HTTP error responses

## Getting Started

1. Install dependencies: `npm install`
2. Build the project: `npm run build`
3. Start the server: `npm start`

The database will be automatically initialized on first run.

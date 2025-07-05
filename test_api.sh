#!/bin/bash

echo "Testing Client Balance Management API"
echo "====================================="

# Test 1: Get all clients (should be empty initially)
echo "1. Getting all clients..."
curl -X GET http://localhost:8080/api/clients
echo -e "\n"

# Test 2: Create a client
echo "2. Creating a client..."
curl -X POST http://localhost:8080/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
echo -e "\n"

# Test 3: Get all clients (should have one client)
echo "3. Getting all clients after creation..."
curl -X GET http://localhost:8080/api/clients
echo -e "\n"

# Test 4: Get client by ID
echo "4. Getting client by ID 1..."
curl -X GET http://localhost:8080/api/clients/1
echo -e "\n"

# Test 5: Make a deposit
echo "5. Making a deposit of $100..."
curl -X POST http://localhost:8080/api/clients/1/deposit \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'
echo -e "\n"

# Test 6: Make a withdrawal
echo "6. Making a withdrawal of $50..."
curl -X POST http://localhost:8080/api/clients/1/withdraw \
  -H "Content-Type: application/json" \
  -d '{"amount": 50}'
echo -e "\n"

# Test 7: Get client by ID to see final balance
echo "7. Getting client by ID 1 to see final balance..."
curl -X GET http://localhost:8080/api/clients/1
echo -e "\n"

# Test 8: Update client information
echo "8. Updating client information..."
curl -X PUT http://localhost:8080/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "email": "jane@example.com"}'
echo -e "\n"

# Test 9: Try to create client with duplicate email (should fail)
echo "9. Trying to create client with duplicate email..."
curl -X POST http://localhost:8080/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name": "Another User", "email": "jane@example.com"}'
echo -e "\n"

# Test 10: Try to withdraw more than balance (should fail)
echo "10. Trying to withdraw more than balance..."
curl -X POST http://localhost:8080/api/clients/1/withdraw \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000}'
echo -e "\n"

echo "Testing complete!"

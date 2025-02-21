# NetLogo Code Prettifier API

This is a REST API service that provides NetLogo code formatting capabilities. It uses the CodeMirror NetLogo extension to format NetLogo code according to standard formatting rules.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npx tsx src/server.ts
   ```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

## API Usage

### Format NetLogo Code

**Endpoint:** `POST /prettify`

**Request Body:**

```json
{
  "code": "your NetLogo code here",
  "lineWidth": 100 // optional, defaults to 100
}
```

**Example Request:**

```bash
curl -X POST http://localhost:3000/prettify \
  -H "Content-Type: application/json" \
  -d '{
    "code": "to setup clear-all create-turtles 10 [ setxy random-xcor random-ycor ] reset-ticks end",
    "lineWidth": 80
  }'
```

**Example Response:**

```json
{
  "formatted": "to setup\n  clear-all\n  create-turtles 10 [\n    setxy random-xcor random-ycor\n  ]\n  reset-ticks\nend"
}
```

### Error Responses

If there's an error, the API will return a JSON response with an error message:

```json
{
  "error": "Error message here",
  "details": "Detailed error information"
}
```

## Development

To build the project:

```bash
npm run build
```

To run tests:

```bash
npm test
```

## License

This project is licensed under the GPL-2.0 License - see the LICENSE file for details.

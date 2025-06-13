import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';

// Comprehensive OpenAPI spec for the enterprise notification API
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "DheeNotifications Enterprise API",
    version: "2.0.0",
    description: "Enterprise-grade notification platform API with multi-channel support, templates, analytics, and batch processing.",
    contact: {
      name: "Dheemanth M",
      email: "dheemanthmadaiah@gmail.com"
    }
  },
  servers: [
    {
      url: "http://localhost:12000/api",
      description: "Development server"
    },
    {
      url: "https://dheenotifications-production.up.railway.app/api",
      description: "Production server"
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      },
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key"
      }
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          role: { type: "string", enum: ["ADMIN", "USER", "READONLY"] },
          apiKey: { type: "string" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      NotificationRequest: {
        type: "object",
        required: ["to", "channel", "message"],
        properties: {
          to: { type: "string", description: "Recipient (email, phone, or user ID)" },
          channel: { type: "string", enum: ["email", "sms", "in-app", "push"] },
          message: { type: "string", maxLength: 5000 },
          subject: { type: "string", maxLength: 255, description: "Required for email" },
          sendAt: { type: "string", format: "date-time", description: "Schedule for later" },
          templateId: { type: "integer", description: "Use template instead of message" },
          variables: { type: "object", description: "Template variables" }
        }
      },
      Template: {
        type: "object",
        required: ["name", "body", "channel"],
        properties: {
          id: { type: "integer" },
          name: { type: "string", maxLength: 100 },
          subject: { type: "string", maxLength: 255 },
          body: { type: "string", maxLength: 10000 },
          channel: { type: "string", enum: ["email", "sms", "in-app", "push"] },
          variables: { type: "array", items: { type: "string" } },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      BatchRequest: {
        type: "object",
        required: ["name", "channel", "recipients", "message"],
        properties: {
          name: { type: "string" },
          channel: { type: "string", enum: ["email", "sms", "in-app", "push"] },
          recipients: { type: "array", items: { type: "string" }, maxItems: 1000 },
          message: { type: "string" },
          subject: { type: "string" },
          templateId: { type: "integer" },
          sendAt: { type: "string", format: "date-time" }
        }
      },
      Analytics: {
        type: "object",
        properties: {
          summary: {
            type: "object",
            properties: {
              totalSent: { type: "integer" },
              totalDelivered: { type: "integer" },
              totalFailed: { type: "integer" },
              deliveryRate: { type: "number" },
              openRate: { type: "number" },
              failureRate: { type: "number" }
            }
          },
          channelStats: { type: "object" },
          dailyTrends: { type: "array" },
          userStats: { type: "object" }
        }
      }
    }
  },
  security: [
    { BearerAuth: [] },
    { ApiKeyAuth: [] }
  ],
  paths: {
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                  name: { type: "string" },
                  role: { type: "string", enum: ["USER", "ADMIN"], default: "USER" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "User registered successfully" },
          400: { description: "Validation error or user already exists" }
        }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Login successful" },
          401: { description: "Invalid credentials" }
        }
      }
    },
    "/notify": {
      post: {
        tags: ["Notifications"],
        summary: "Send or schedule a notification",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/NotificationRequest" }
            }
          }
        },
        responses: {
          202: { description: "Notification queued or scheduled" },
          400: { description: "Validation error" },
          401: { description: "Authentication required" }
        }
      }
    },
    "/templates": {
      get: {
        tags: ["Templates"],
        summary: "Get user templates",
        responses: {
          200: {
            description: "List of templates",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Template" }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Templates"],
        summary: "Create a new template",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Template" }
            }
          }
        },
        responses: {
          201: { description: "Template created" },
          400: { description: "Validation error" }
        }
      }
    },
    "/batch": {
      post: {
        tags: ["Batch Processing"],
        summary: "Create batch notification job",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BatchRequest" }
            }
          }
        },
        responses: {
          201: { description: "Batch job created" },
          400: { description: "Validation error" }
        }
      }
    },
    "/batch/upload-csv": {
      post: {
        tags: ["Batch Processing"],
        summary: "Upload CSV for batch notifications",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  csvFile: { type: "string", format: "binary" },
                  channel: { type: "string", enum: ["email", "sms", "in-app", "push"] },
                  templateId: { type: "integer" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "CSV processed successfully" },
          400: { description: "Invalid file or validation error" }
        }
      }
    },
    "/analytics/dashboard": {
      get: {
        tags: ["Analytics"],
        summary: "Get dashboard analytics",
        parameters: [
          {
            name: "days",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 365, default: 30 }
          }
        ],
        responses: {
          200: {
            description: "Analytics data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Analytics" }
              }
            }
          }
        }
      }
    },
    "/analytics/realtime": {
      get: {
        tags: ["Analytics"],
        summary: "Get real-time metrics",
        responses: {
          200: { description: "Real-time metrics" }
        }
      }
    },
    "/logs": {
      get: {
        tags: ["Logs"],
        summary: "Get notification logs",
        parameters: [
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 1000, default: 100 }
          },
          {
            name: "offset",
            in: "query",
            schema: { type: "integer", minimum: 0, default: 0 }
          },
          {
            name: "channel",
            in: "query",
            schema: { type: "string", enum: ["email", "sms", "in-app", "push"] }
          },
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["success", "failed", "pending"] }
          }
        ],
        responses: {
          200: { description: "Notification logs with pagination" }
        }
      }
    },
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        security: [],
        responses: {
          200: { description: "System healthy" },
          503: { description: "System unhealthy" }
        }
      }
    }
  }
};

export default Router().use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "DheeNotifications API Documentation"
}));
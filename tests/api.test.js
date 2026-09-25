const request = require('supertest');
const app = require('../backend/src/app');
const db = require('../backend/src/config/db');
const { seedDatabase } = require('../backend/src/scripts/seed');

describe('Support Ticket Management System - End-to-End API Test Suite', () => {
  let customer1Token = '';
  let customer1Id = null;
  let customer2Token = '';
  let customer2Id = null;
  let agentToken = '';
  let agentId = null;
  let createdTicketId = null;
  let customer2TicketId = null;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await db.initSqliteEngine();
    await seedDatabase();

    // Login as default Customer 1
    const resCustomer = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@demo.com', password: 'Customer123!' });
    customer1Token = resCustomer.body.token;
    customer1Id = resCustomer.body.user.id;

    // Login as default Customer 2 (Alice)
    const resCustomer2 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@demo.com', password: 'Customer123!' });
    customer2Token = resCustomer2.body.token;
    customer2Id = resCustomer2.body.user.id;

    // Login as default Agent
    const resAgent = await request(app)
      .post('/api/auth/login')
      .send({ email: 'agent@support.com', password: 'Agent123!' });
    agentToken = resAgent.body.token;
    agentId = resAgent.body.user.id;
  });

  afterAll(async () => {
    await db.close();
  });

  // --------------------------------------------------------------------------
  // 1. Authentication Tests
  // --------------------------------------------------------------------------
  describe('Authentication & Authorization', () => {
    test('1. Valid customer registration succeeds', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New Tester',
          email: 'newtester@demo.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('newtester@demo.com');
      expect(res.body.user.role).toBe('customer');
    });

    test('2. Registration with duplicate email is rejected (400)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate John',
          email: 'customer@demo.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    test('3. Valid login succeeds and returns JWT token (200)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer@demo.com',
          password: 'Customer123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('customer');
    });

    test('4. Invalid password is rejected (401)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer@demo.com',
          password: 'WrongPassword!'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    test('5. Unauthorized access without token is rejected (401)', async () => {
      const res = await request(app).get('/api/tickets');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Ticket Management Tests
  // --------------------------------------------------------------------------
  describe('Ticket Operations & Access Control', () => {
    test('6. Customer can create a new ticket (201)', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          subject: 'Broken billing portal submit button',
          description: 'Clicking submit triggers a JavaScript TypeError in billing.js',
          priority: 'high'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.ticket.id).toBeDefined();
      expect(res.body.ticket.subject).toBe('Broken billing portal submit button');
      expect(res.body.ticket.status).toBe('open');
      expect(res.body.ticket.priority).toBe('high');

      createdTicketId = res.body.ticket.id;
    });

    test('7. Customer cannot access another customer’s ticket (403)', async () => {
      // Create a ticket under customer 2 (Alice)
      const tRes = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${customer2Token}`)
        .send({
          subject: 'Alice Private Issue',
          description: 'Confidential customer inquiry that Customer 1 must not see',
          priority: 'medium'
        });
      customer2TicketId = tRes.body.ticket.id;

      // Customer 1 attempts to view Customer 2's ticket
      const res = await request(app)
        .get(`/api/tickets/${customer2TicketId}`)
        .set('Authorization', `Bearer ${customer1Token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/forbidden/i);
    });

    test('8. Support Agent can view any ticket and all tickets (200)', async () => {
      const res = await request(app)
        .get(`/api/tickets/${customer2TicketId}`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.ticket.id).toBe(customer2TicketId);
    });

    test('9. Support Agent can update ticket status and priority (200)', async () => {
      const res = await request(app)
        .put(`/api/tickets/${createdTicketId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          status: 'in_progress',
          priority: 'urgent',
          assigned_to: agentId
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.ticket.status).toBe('in_progress');
      expect(res.body.ticket.priority).toBe('urgent');
      expect(res.body.ticket.assigned_to).toBe(agentId);
    });

    test('10. Invalid/non-existent ticket ID returns 404', async () => {
      const res = await request(app)
        .get('/api/tickets/999999')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/ticket not found/i);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Comments & Agent Dashboard Stats
  // --------------------------------------------------------------------------
  describe('Ticket Comments & Agent Dashboard Stats', () => {
    test('11. Customer can add a comment to their ticket (201)', async () => {
      const res = await request(app)
        .post(`/api/tickets/${createdTicketId}/comments`)
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          comment: 'Any updates from the engineering team on this bug?'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.comment.comment).toBe('Any updates from the engineering team on this bug?');
      expect(res.body.comment.user_name).toBe('John Customer');
    });

    test('12. Agent can fetch summary statistics (200)', async () => {
      const res = await request(app)
        .get('/api/tickets/stats/summary')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.total).toBeGreaterThan(0);
      expect(res.body.stats.open).toBeDefined();
      expect(res.body.stats.in_progress).toBeDefined();
    });

    test('13. Customer is forbidden from accessing agent statistics (403)', async () => {
      const res = await request(app)
        .get('/api/tickets/stats/summary')
        .set('Authorization', `Bearer ${customer1Token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('14. Requirement 8: Example JOIN query returns open tickets with customer info', async () => {
      const res = await request(app).get('/api/example-query');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      if (res.body.data.length > 0) {
        expect(res.body.data[0].customer_name).toBeDefined();
        expect(res.body.data[0].customer_email).toBeDefined();
        expect(res.body.data[0].status).toBe('open');
      }
    });
  });
});

'use strict';
// routes/payments.js
//
// Makes POST /payments idempotent using an Idempotency-Key.

const router = require('express').Router();
const { charges, idempotency, nextChargeId } = require('../store');

router.post('/', (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];

  // Rule 1: Missing key -> respond 400
  if (!idempotencyKey) {
    return res.status(400).json({
      error: {
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Idempotency-Key header is required',
      },
    });
  }

  // Rule 2: Repeat key -> return cached response without creating a new charge
  if (idempotency.has(idempotencyKey)) {
    const cachedResponse = idempotency.get(idempotencyKey);
    return res.status(cachedResponse.status).json(cachedResponse.body);
  }

  // Rule 3: New key -> create exactly ONE charge, cache response, return 201
  const amount = req.body && req.body.amount;
  const charge = { id: nextChargeId(), amount, status: 'charged' };
  charges.push(charge);

  const responseBody = { id: charge.id, amount: charge.amount, status: charge.status };
  const responseData = { status: 201, body: responseBody };

  idempotency.set(idempotencyKey, responseData);

  return res.status(201).json(responseBody);
});

module.exports = router;

import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import mongoose from 'mongoose';
import { OrderStatus } from '@agreejwc/common';

const newId = () => {
  return new mongoose.Types.ObjectId().toHexString();
};

it('throw an error if order not found', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'falkj3klefkl3',
      orderId: '234fdskfajl3',
    })
    .expect(404);
});

it('throw an error if user is not authenticated', async () => {
  const order = Order.build({
    id: newId(),
    version: 0,
    status: OrderStatus.Created,
    userId: newId(),
    price: 10,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'falkj3klefkl3',
      orderId: order.id,
    })
    .expect(401);
});

it('throw an error if order is already cancelled', async () => {
  const userId = newId();
  const cookie = global.signin(userId);

  const order = Order.build({
    id: newId(),
    version: 0,
    status: OrderStatus.Cancelled,
    userId,
    price: 10,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', cookie)
    .send({
      token: 'falkj3klefkl3',
      orderId: order.id,
    })
    .expect(400);
});

import * as Yup from 'yup';

import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import Order from '../models/Order';

class OrderController {
  async index(req, res) {
    const order = await Order.findAll({
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zip_code',
          ],
        },
      ],
      attributes: ['id', 'product'],
    });

    return res.json(order);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'validation Fail' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const recipientExists = await Recipient.findByPk(recipient_id);
    const deliverymanExists = await Deliveryman.findByPk(deliveryman_id, {
      attributes: ['id', 'name', 'email'],
    });

    if (!recipientExists) {
      return res.status(401).json({ error: 'recipient does not exists' });
    }

    if (!deliverymanExists) {
      return res.status(401).json({ error: 'deliveryman does not exists' });
    }

    const order = await Order.create({
      recipient_id,
      deliveryman_id,
      product,
    });

    return res.json(order);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'validation Fail' });
    }

    const orderExists = await Order.findByPk(req.params.id);

    if (!orderExists) {
      return res.status(401).json({ error: 'order does not exists' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const recipientExists = await Recipient.findByPk(recipient_id);
    const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);

    if (!recipientExists) {
      return res.status(401).json({ error: 'recipient does not Exists' });
    }

    if (!deliverymanExists) {
      return res.status(401).json({ error: 'deliveryman does not Exists' });
    }

    await Order.update(
      {
        recipient_id,
        deliveryman_id,
        product,
      },
      {
        where: { id: req.params.id },
      }
    );

    return res.json({
      recipient_id,
      deliveryman_id,
      product,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const order = await Order.findByPk(id);

    const { product } = order;

    if (!order) {
      return res.status(401).json({ error: 'order does not exists' });
    }

    await order.destroy();

    return res.json({
      id,
      product,
    });
  }
}

export default new OrderController();

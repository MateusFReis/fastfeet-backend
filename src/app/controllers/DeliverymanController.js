import * as Yup from 'yup';

import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const deliverymen = await Deliveryman.findAll({
      attributes: ['id', 'name', 'email'],
      include: {
        model: File,
        as: 'avatar',
        attributes: ['id', 'name'],
      },
      order: ['id'],
    });

    return res.json(deliverymen);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation Fail' });
    }

    const { name, email, avatar_id } = req.body;

    const emailExists = await Deliveryman.findOne({
      where: { email },
    });

    if (emailExists) {
      return res.status(401).json({ error: 'Email already exists' });
    }

    const deliveryman = await Deliveryman.create({
      name,
      email,
      avatar_id,
    });

    return res.json(deliveryman);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      confirmEmail: Yup.string()
        .email()
        .when('email', (email, field) => (email ? field.required() : field)),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation Fail' });
    }

    const deliveryman = await Deliveryman.findByPk(req.params.id);

    const { name, email } = req.body;

    if (email && email !== deliveryman.email) {
      const emailExists = await Deliveryman.findOne({
        where: { email },
      });

      if (emailExists) {
        return res.status(401).json({ error: 'Email already exists' });
      }
    }

    const { id } = await deliveryman.update(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.json({ error: 'Deliveryman does not exists' });
    }
    const { name, email } = deliveryman;

    await deliveryman.destroy();

    return res.json({
      id,
      name,
      email,
    });
  }
}

export default new DeliverymanController();

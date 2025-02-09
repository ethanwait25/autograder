import { Canvas } from '../dao/canvas/Canvas';
import { DB } from '../dao/mysql/Database';
import { PizzaFactory } from '../dao/pizzaFactory/PizzaFactory';
import { User } from '../domain/User';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../logger';

export class UserService {
  private dao: DB;
  private pizzaFactory: PizzaFactory;
  private canvas: Canvas;

  constructor(dao: DB, pizzaFactory: PizzaFactory, canvas: Canvas) {
    this.dao = dao;
    this.pizzaFactory = pizzaFactory;
    this.canvas = canvas;
  }

  async login(netId: string) {
    let token = await this.dao.getToken(netId);
    let user = await this.dao.getUser(netId);
    if (user) {
      if (!user.apiKey) {
        const apiKey = await this.pizzaFactory.getApiKey(netId, user.name);
        this.dao.updateApiKey(netId, apiKey);
        logger.log('info', { type: 'new_api_key', service: 'user_service' }, { netid: netId });
      }
      if (!token) {
        token = uuidv4();
        this.dao.putToken(token, netId);
      }
      return token;
    } else {
      const studentInfo = await this.canvas.getStudentInfo(netId);

      // If student not found in canvas, return null. This will result in a 401 response
      if (!studentInfo) {
        logger.log('error', { type: 'student_not_found_in_canvas', service: 'user_service' }, { netid: netId });
        return null;
      }

      let name = '';
      let email = '';
      try {
        email = studentInfo.email;
        name = studentInfo.short_name;
      } catch (e) {
        name = 'Message TA to update name';
      }
      // Get API key from pizza factory
      const apiKey = await this.pizzaFactory.getApiKey(netId, name);
      user = new User(name, netId, apiKey, '', '', email, 2, false);
      await this.dao.putUser(user);
      // Create token
      token = uuidv4();
      this.dao.putToken(token, netId);
      logger.log('info', { type: 'new_user_created', service: 'user_service' }, { user });

      return token;
    }
  }

  async logout(token: string) {
    await this.dao.deleteToken(token);
  }

  async getUserByNetId(netId: string) {
    return await this.dao.getUser(netId);
  }

  async getUserFuzzySearch(search: string) {
    return await this.dao.getUserFuzzySearch(search);
  }

  async updateUserInfo(netId: string, website: string, github: string, email: string) {
    await this.dao.updateUserInfo(netId, website, github, email);
    return await this.getUserByNetId(netId);
  }
}

import { Request, Response } from 'express';
import { Message } from '../../models/Message.model';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { catchAsync } from '../../utils/catchAsync';

export const createMessage = catchAsync(async (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    throw ApiError.badRequest('Name, email, and message are required');
  }
  
  const newMessage = await Message.create({ name, email, message });
  ApiResponse.created(res, newMessage, 'Message sent successfully');
});

export const getMessages = catchAsync(async (req: Request, res: Response) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  ApiResponse.success(res, messages);
});

export const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const message = await Message.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );
  if (!message) throw ApiError.notFound('Message not found');
  ApiResponse.success(res, message, 'Message marked as read');
});

export const deleteMessage = catchAsync(async (req: Request, res: Response) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) throw ApiError.notFound('Message not found');
  ApiResponse.success(res, null, 'Message deleted');
});

import 'reflect-metadata';
import { Injectable, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
@Injectable() class A2 { constructor(public b: B2) {} }
@Injectable() class B2 { constructor(public a: A2) {} }
@Module({ providers: [A2, B2] }) class AppCircularErro {}
await NestFactory.createApplicationContext(AppCircularErro, { logger: false, abortOnError: false });

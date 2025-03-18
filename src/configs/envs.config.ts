import * as dotenv from 'dotenv';
import * as joi from 'joi';
import * as fs from 'fs';
import * as path from 'path';
import { BaseDataSourceOptions } from 'typeorm/data-source/BaseDataSourceOptions';

export const DEVELOPMENT = 'development';
export const PRODUCTION = 'production';

const { NODE_ENV = DEVELOPMENT } = process.env;
console.log('🚀 ~ NODE_ENV:', NODE_ENV);

// Determinar la ruta del archivo .env
const envPath = NODE_ENV === DEVELOPMENT ? '.env' : '.env.prod';
console.log('🚀 ~ Ruta del archivo .env:', path.resolve(envPath));

// Verificar si el archivo existe
try {
  const fileExists = fs.existsSync(path.resolve(envPath));
  console.log('🚀 ~ ¿El archivo existe?:', fileExists);

  if (fileExists) {
    // Leer el contenido del archivo
    const fileContent = fs.readFileSync(path.resolve(envPath), 'utf8');
    console.log('🚀 ~ Contenido del archivo .env:');
    console.log(fileContent);
  }
} catch (error) {
  console.error('🚀 ~ Error al verificar/leer el archivo:', error);
}

// load environment file
const result = dotenv.config({
  path: envPath,
});

console.log('🚀 ~ Resultado de dotenv.config():', result);

interface IEnvVars {
  DB_DATABASE: string;
  DB_DIALECT: string;
  DB_HOST: string;
  DB_PASSWORD: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_URL: string;
  PORT: number;
  NODE_ENV: string;
  IS_DEV: boolean;
}

// valid values for dialect and environment
const dialectValues: BaseDataSourceOptions['type'][] = [
  'mysql',
  'postgres',
  'sqlite',
  'mariadb',
  'mssql',
  'oracle',
];

const environmentValues = [DEVELOPMENT, PRODUCTION];

const envVarsSchema = joi
  .object({
    NODE_ENV: joi.string().valid(...environmentValues),
    DB_DIALECT: joi
      .string()
      .valid(...dialectValues)
      .required(),
    PORT: joi.number().required(),
    IS_DEV: joi.boolean(),
    DB_HOST: joi.when('NODE_ENV', {
      is: DEVELOPMENT,
      then: joi.string().required(),
      otherwise: joi.string().optional(),
    }),
    DB_PORT: joi.when('NODE_ENV', {
      is: DEVELOPMENT,
      then: joi.number().required(),
      otherwise: joi.number().optional(),
    }),
    DB_USERNAME: joi.when('NODE_ENV', {
      is: DEVELOPMENT,
      then: joi.string().required(),
      otherwise: joi.string().optional(),
    }),
    DB_PASSWORD: joi.when('NODE_ENV', {
      is: DEVELOPMENT,
      then: joi.string().required(),
      otherwise: joi.string().optional(),
    }),
    DB_DATABASE: joi.when('NODE_ENV', {
      is: DEVELOPMENT,
      then: joi.string().required(),
      otherwise: joi.string().optional(),
    }),
    DB_URL: joi.when('NODE_ENV', {
      is: PRODUCTION,
      then: joi.string().required(),
      otherwise: joi.string().optional(),
    }),
  })
  .unknown(true);

// Mostrar las variables de entorno antes de la validación
console.log('🚀 ~ Variables de entorno disponibles:', process.env);

// validate environment variables
const { error, value } = envVarsSchema.validate({
  ...process.env,
  IS_DEV: NODE_ENV === DEVELOPMENT,
});

if (error) {
  console.error('🚀 ~ Error de validación:', error.message);
  throw new Error(
    `[ENV: ${NODE_ENV}] Config validation error: ${error.message}`,
  );
}

const envVars: IEnvVars = value;

export const envs = {
  port: envVars.PORT,
  nodeEnv: envVars.NODE_ENV,
  isDev: envVars.IS_DEV,
  db: {
    dialect: envVars.DB_DIALECT,
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    username: envVars.DB_USERNAME,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_DATABASE,
    url: envVars.DB_URL,
  },
};

console.log('🚀 ~ envs:', envs);

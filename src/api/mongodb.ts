import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// Guaranteed to be a string after the check above
const mongodbUri: string = uri;

// Configuração global do Mongoose
mongoose.set('debug', process.env.NODE_ENV === 'development');
mongoose.set('strictQuery', true);

// Configurações de conexão
const mongooseOptions = {
    serverSelectionTimeoutMS: 5000,  // Tempo de seleção do servidor
    socketTimeoutMS: 45000,  // Timeout para operações de socket
    connectTimeoutMS: 10000,  // Tempo máximo para conectar
    maxPoolSize: 10,  // Número máximo de conexões simultâneas
    minPoolSize: 2,   // Número mínimo de conexões mantidas
};

// Função para conectar ao banco de dados
async function connectToDatabase() {
    try {
        // Cliente MongoDB
        const client = new MongoClient(mongodbUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        // Conectar cliente MongoDB
        // Conectar Mongoose
        await mongoose.connect(mongodbUri, mongooseOptions);

        // Conectar Mongoose
        await mongoose.connect(mongodbUri, mongooseOptions);
        mongoose.connection.on('connected', () => {
            console.log('Conexão Mongoose estabelecida');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Erro na conexão Mongoose:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Conexão Mongoose encerrada');
        });

        return client.db(process.env.MONGODB_DB);
    } catch (error) {
        console.error('Falha na conexão com MongoDB:', error);
        
        // Tratamento de erro de conexão
        if (error instanceof Error) {
            throw new Error(`Erro de conexão: ${error.message}`);
        }
        
        throw error;
    }
}

// Exportar funções de conexão
export { 
    connectToDatabase, 
    mongoose 
};
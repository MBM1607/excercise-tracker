import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import users from './users.js';

dotenv.config();

mongoose.connect(
	'mongodb+srv://cluster0.mtrwe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
	{
		user: process.env.MONGO_USER,
		pass: process.env.MONGO_PASSWORD,
		useNewUrlParser: true,
		useUnifiedTopology: true
	},
	(e) => {
		console.log(e);
	}
);



const app = express();

app.use(cors());
app.use(express.static('public'));

app.get('/', (_req, res) => {
	res.sendFile(process.cwd() + '/views/index.html')
});

app.use('/api/users', users);

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Your app is listening on port ${port}`)
});

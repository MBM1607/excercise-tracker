import e from 'cors';
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

const userSchema = mongoose.Schema({
	username: { type: String, required: true, unique: true },
});

const findUser = async (userId, res) => {
	if (!mongoose.Types.ObjectId.isValid(userId)) {
		res.status(400).json({
			message: 'Invalid userId'
		})
		return null;
	}
	const user = await User.findById(userId).exec();
	if (!user) {
		res.status(404).json({
			message: 'No user exists with that id.'
		})
	}
	return user;
};

const User = mongoose.model('User', userSchema);

const exerciseSchema = mongoose.Schema({
	username: { type: String, required: true },
	description: { type: String, required: true },
	duration: { type: Number, required: true },
	date: { type: Date, required: true },
});
const Exercise = mongoose.model('Exercise', exerciseSchema);

router.use(express.urlencoded({ extended: true }));

router.route('/')
	.post(async (req, res) => {
		try {
			const user = new User({ username: req.body.username });
			await user.save();
			res.json(user);
		}
		catch (e) {
			res.status(409).json({
				error: 'User already exists!'
			})
		}
	})
	.get(async (req, res) => {
		const users = await User.find();
		res.json(users);
	});

router.get('/:userId', async (req, res) => {
	const user = await findUser(req.params.userId, res)

	res.json(user);
});

router.post('/:userId/exercises', async (req, res) => {
	const user = await findUser(req.params.userId, res);

	try {
		const exercise = new Exercise({
			username: user.username,
			description: req.body.description,
			duration: req.body.duration,
			date: req.body.date ? new Date(req.body.date) : new Date()
		});

		await exercise.save();

		res.json({
			_id: req.params.userId,
			username: exercise.username,
			date: exercise.date.toDateString(),
			duration: exercise.duration,
			description: exercise.description
		});
	}
	catch (e) {
		console.error(e);
		res.status(500).json({
			message: 'Exercise creation failed!'
		})
	}
});

router.get('/:userId/logs', async (req, res) => {
	const user = await findUser(req.params.userId, res);
	try {
		const query = { username: user.username, date: { $ne: null } };

		if (req.query.from) query["date"]["$gte"] = new Date(req.query.from);
		if (req.query.to) query["date"]["$lte"] = new Date(req.query.to);

		let logs = await (
			Exercise.find(query)
			.limit(req.query.limit ? parseInt(req.query.limit) : null)
			.exec()
		);

		res.json({
			_id: user._id,
			username: user.username,
			count: logs.length,
			log: logs.map(log => {
				return {
					description: log.description,
					duration: log.duration,
					date: log.date.toDateString()
				}
			})
		})
	}
	catch (e) {
		res.status(500).json({
			message: "There was problem with the request."
		})
	}

});

export default router;

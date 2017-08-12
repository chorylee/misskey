/**
 * Module dependencies
 */
import $ from 'cafy';
import User from '../../models/user';

/**
 * Aggregate users
 *
 * @param {any} params
 * @return {Promise<any>}
 */
module.exports = params => new Promise(async (res, rej) => {
	// Get 'limit' parameter
	const [limit = 365, limitErr] = $(params.limit).optional.number().range(1, 365).$;
	if (limitErr) return rej('invalid limit param');

	const users = await User
		.find({}, {
			_id: false,
			created_at: true,
			deleted_at: true
		}, {
			sort: { created_at: -1 }
		});

	const graph = [];

	for (let i = 0; i < limit; i++) {
		let dayStart = new Date(new Date().setDate(new Date().getDate() - i));
		dayStart = new Date(dayStart.setMilliseconds(0));
		dayStart = new Date(dayStart.setSeconds(0));
		dayStart = new Date(dayStart.setMinutes(0));
		dayStart = new Date(dayStart.setHours(0));

		let dayEnd = new Date(new Date().setDate(new Date().getDate() - i));
		dayEnd = new Date(dayEnd.setMilliseconds(999));
		dayEnd = new Date(dayEnd.setSeconds(59));
		dayEnd = new Date(dayEnd.setMinutes(59));
		dayEnd = new Date(dayEnd.setHours(23));
		// day = day.getTime();

		const total = users.filter(u =>
			u.created_at < dayEnd && (u.deleted_at == null || u.deleted_at > dayEnd)
		).length;

		const created = users.filter(u =>
			u.created_at < dayEnd && u.created_at > dayStart
		).length;

		graph.push({
			total: total,
			created: created
		});
	}

	res(graph);
});
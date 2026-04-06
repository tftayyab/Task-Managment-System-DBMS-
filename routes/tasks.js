const express = require('express');
const taskRepo = require('../repositories/tasks');
const teamRepo = require('../repositories/teams');
const { validateTasks } = require('../validations/Tasksvalidation');
const validateRequest = require('../middleware/validateRequest');
const asyncWrapper = require('../middleware/asyncWrapper');
const verifyToken = require('../middleware/verifyToken');
const { getIO } = require('../socket');

const router = express.Router();
router.use(verifyToken);

router.post(
  '/',
  validateRequest(validateTasks),
  asyncWrapper(async (req, res) => {
    const owner = req.user.username;
    const { teamIds = [], createdAt } = req.validatedBody;
    const io = getIO();

    let shareWith = [];

    if (teamIds.length > 0) {
      const numericIds = teamIds.map((id) => Number(id)).filter((n) => !Number.isNaN(n));
      const teams = await teamRepo.getTeamsByIds(numericIds);
      const members = teams.flatMap((team) => team.shareWith || []);
      shareWith = [...new Set(members)].filter((username) => username !== owner);
    }

    const task = await taskRepo.createTask(
      { ...req.validatedBody, createdAt },
      owner,
      teamIds,
      shareWith
    );

    teamIds.forEach((teamId) => {
      io.to(String(teamId)).emit('task_created', {
        message: `New task "${task.title}" added to your team`,
        teamId,
      });
    });

    shareWith.forEach((username) => {
      io.to(username).emit('task_created', {
        message: `A new task "${task.title}" was shared with you`,
        teamId: teamIds[0],
      });
    });

    res.status(201).json({ message: 'Task created', task });
  })
);

router.get(
  '/',
  asyncWrapper(async (req, res) => {
    const username = req.user.username;
    const tasks = await taskRepo.findForUser(username);
    res.json(tasks);
  })
);

router.get(
  '/shared',
  asyncWrapper(async (req, res) => {
    const currentUser = req.user.username;
    const { teams, tasks } = await taskRepo.sharedTeamsAndTasks(currentUser);
    res.json({ teams, tasks });
  })
);

module.exports = router;

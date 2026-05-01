const express = require('express');
const taskRepo = require('../repositories/tasks');
const teamRepo = require('../repositories/teams');
const { validateTasks } = require('../validations/Tasksvalidation');
const validateRequest = require('../middleware/validateRequest');
const isValidIdParam = require('../utils/validateId');
const asyncWrapper = require('../middleware/asyncWrapper');
const verifyToken = require('../middleware/verifyToken');
const { getIO } = require('../socket');

const router = express.Router();
router.use(verifyToken);

router.get(
  '/:id',
  asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const username = req.user.username;

    if (!isValidIdParam(id)) {
      return res.status(400).json({ message: 'Invalid Task ID format' });
    }

    const task = await taskRepo.findById(Number(id));
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.owner !== username && !task.shareWith.includes(username)) {
      return res.status(403).json({ message: 'You are not allowed to view this task' });
    }

    res.json(task);
  })
);

router.put(
  '/:id',
  validateRequest(validateTasks),
  asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const username = req.user.username;

    if (!isValidIdParam(id)) {
      return res.status(400).json({ message: 'Invalid Task ID format' });
    }

    const existingTask = await taskRepo.findById(Number(id));
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (existingTask.owner !== username) {
      return res.status(403).json({ message: 'You are not allowed to update this task' });
    }

    const { title, description, status, dueDate, teamIds = [] } = req.validatedBody;

    let shareWith = [];
    if (teamIds.length > 0) {
      const numericIds = teamIds.map((t) => Number(t)).filter((n) => !Number.isNaN(n));
      const teams = await teamRepo.getTeamsByIds(numericIds);
      const members = teams.flatMap((team) => team.shareWith || []);
      shareWith = [...new Set(members)].filter((user) => user !== username);
    }

    const updatedTask = await taskRepo.updateTask(
      Number(id),
      username,
      { title, description, status, dueDate },
      teamIds,
      shareWith
    );

    const io = getIO();
    const fullTask = await taskRepo.findById(Number(id));
    if (fullTask) {
      (fullTask.shareWith || []).forEach((u) => {
        if (u && u !== username) {
          io.to(String(u)).emit('task_updated', {
            message: `${username} updated "${fullTask.title}"`,
            taskId: String(id),
          });
        }
      });
    }

    res.json({ message: 'Task updated', task: updatedTask });
  })
);

router.delete(
  '/:id',
  asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const username = req.user.username;

    if (!isValidIdParam(id)) {
      return res.status(400).json({ message: 'Invalid Task ID format' });
    }

    const task = await taskRepo.findById(Number(id));
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.owner !== username) {
      return res.status(403).json({ message: 'You are not allowed to delete this task' });
    }

    await taskRepo.deleteTask(Number(id), username);
    res.json({ message: 'Task deleted', task });
  })
);

router.put(
  '/:id/share',
  asyncWrapper(async (req, res) => {
    const taskId = req.params.id;
    const { teamName, usernames = [] } = req.body;
    const owner = req.user.username;

    if (!isValidIdParam(taskId)) {
      return res.status(400).json({ message: 'Invalid Task ID format' });
    }

    if (!Array.isArray(usernames) || usernames.length > 5) {
      return res.status(400).json({ message: 'You can only add up to 5 users' });
    }

    if (!teamName || typeof teamName !== 'string') {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const updatedTeam = await teamRepo.upsertTeamAddMembers(owner, teamName, usernames);

    const task = await taskRepo.findById(Number(taskId));
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const teamIdStr = String(updatedTeam._id);
    const mergedTeamIds = [...new Set([...(task.teamIds || []).map(String), teamIdStr])];

    const updatedTask = await taskRepo.updateTask(
      Number(taskId),
      owner,
      {
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate,
      },
      mergedTeamIds,
      usernames
    );

    const io = getIO();

    usernames.forEach((uname) => {
      io.to(uname).emit('task_created', {
        message: `Task "${task.title}" was shared with you`,
        teamId: updatedTeam._id,
      });
    });

    io.to(String(updatedTeam._id)).emit('team_updated', {
      message: `Team "${updatedTeam.teamName}" has been updated`,
      teamId: updatedTeam._id,
    });

    res.json({ message: 'Team shared/updated', team: updatedTeam, task: updatedTask });
  })
);

module.exports = router;

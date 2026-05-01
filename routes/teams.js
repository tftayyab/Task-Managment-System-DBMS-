const express = require('express');
const teamRepo = require('../repositories/teams');
const asyncWrapper = require('../middleware/asyncWrapper');
const verifyToken = require('../middleware/verifyToken');
const { getIO } = require('../socket');
const isValidIdParam = require('../utils/validateId');

const router = express.Router();
router.use(verifyToken);

router.post(
  '/',
  asyncWrapper(async (req, res) => {
    const { teamName, usernames = [] } = req.body;
    const owner = req.user.username;

    if (!teamName || typeof teamName !== 'string') {
      return res.status(400).json({ message: 'Team name is required' });
    }

    if (!Array.isArray(usernames) || usernames.length > 5) {
      return res.status(400).json({ message: 'You can only add up to 5 users' });
    }

    const team = await teamRepo.upsertTeamAddMembers(owner, teamName, usernames);

    const io = getIO();

    usernames.forEach((username) => {
      io.to(username).emit('team_added', {
        message: `You've been added to team "${team.teamName}"`,
        teamId: team._id,
      });
    });

    io.to(String(team._id)).emit('team_updated', {
      message: `Team "${team.teamName}" was updated`,
      teamId: team._id,
    });

    res.status(201).json({ message: 'Team created/updated', team });
  })
);

router.delete(
  '/:id',
  asyncWrapper(async (req, res) => {
    const teamId = req.params.id;
    const username = req.user.username;

    if (!isValidIdParam(teamId)) {
      return res.status(400).json({ message: 'Invalid team ID' });
    }

    const team = await teamRepo.getTeamById(Number(teamId));
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.owner !== username) {
      return res.status(403).json({ message: 'Only the team owner can delete this team' });
    }

    const ok = await teamRepo.deleteTeam(Number(teamId), username);
    if (!ok) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({ message: 'Team deleted successfully' });
  })
);

router.put(
  '/:id',
  asyncWrapper(async (req, res) => {
    const teamId = req.params.id;
    const { teamName, usernames = [] } = req.body;
    const username = req.user.username;

    if (!isValidIdParam(teamId)) {
      return res.status(400).json({ message: 'Invalid team ID' });
    }

    if (!teamName || typeof teamName !== 'string') {
      return res.status(400).json({ message: 'Team name is required' });
    }

    if (!Array.isArray(usernames) || usernames.length > 5) {
      return res.status(400).json({ message: 'Max 5 members allowed' });
    }

    const team = await teamRepo.updateTeam(Number(teamId), username, teamName, usernames);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({ message: 'Team updated successfully', team });
  })
);

module.exports = router;

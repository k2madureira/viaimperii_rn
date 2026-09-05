import * as assetsService from './assets';
import * as authService from './auth';
import * as campaignsService from './campaigns';
import * as chatService from './chat';
import * as clanService from './clan';
import * as dailyRewardsService from './dailyRewards';
import * as feedService from './feed';
import * as friendshipService from './friendship';
import * as leaderboardsService from './leaderboards';
import * as legionService from './legion';
import * as legionLeaderboardService from './legionLeaderboard';
import * as legionTreasuryService from './legionTreasury';
import * as missionsService from './missions';
import * as notificationsService from './notifications';
import * as physicalService from './physical';
import * as presenceService from './presence';
import * as professionsService from './professions';
import * as provincesService from './provinces';
import * as quizService from './quiz';
import * as rankingService from './ranking';
import * as ranksService from './ranks';
import * as rewardsService from './rewards';
import * as searchService from './search';
import * as specialtiesService from './specialties';
import * as streakService from './streak';
import * as tributesService from './tributes';
import * as uploadService from './upload';
import * as usersService from './users';
import * as walletService from './wallet';

// Facade único de consumo das APIs. Hooks (React Query) usam
// `viaimperiiApi.<domínio>.<operação>` como queryFn/mutationFn. Ver CLAUDE.md §0.3.
export const viaimperiiApi = {
  assets: {
    catalog: assetsService.getAssetCatalog,
    owned: assetsService.getOwnedAssets,
    buy: assetsService.buyAsset,
    equip: assetsService.equipAsset,
  },
  auth: {
    login: authService.loginRequest,
    createUser: authService.createUserRequest,
    updatePassword: authService.updatePasswordRequest,
    verifyToken: authService.verifyTokenRequest,
    forgotPassword: authService.forgotPasswordRequest,
    resetPassword: authService.resetPasswordRequest,
    oauthPoll: authService.oauthPoll,
    sseTicket: authService.getSseTicket,
    logout: authService.logoutRequest,
  },
  campaigns: {
    list: campaignsService.getCampaigns,
  },
  chat: {
    conversations: chatService.getConversations,
    openDm: chatService.openDm,
    openLegion: chatService.openLegionChat,
    openClan: chatService.openClanChat,
    messages: chatService.getMessages,
    sendMessage: chatService.sendMessage,
    markRead: chatService.markRead,
    deleteMessage: chatService.deleteMessage,
    reportMessage: chatService.reportMessage,
  },
  clan: {
    list: clanService.getClans,
    detail: clanService.getClan,
    userClan: clanService.getUserClan,
    create: clanService.createClan,
    invite: clanService.inviteToClan,
    myInvites: clanService.getMyClanInvites,
    acceptInvite: clanService.acceptClanInvite,
    declineInvite: clanService.declineClanInvite,
    promote: clanService.promoteMember,
    demote: clanService.demoteMember,
    kick: clanService.kickMember,
    leave: clanService.leaveClan,
    transfer: clanService.transferClan,
    upgrade: clanService.upgradeClan,
    setEmblem: clanService.setClanEmblem,
    requestJoin: clanService.requestJoinClan,
    myJoinRequests: clanService.getMyJoinRequests,
    clanJoinRequests: clanService.getClanJoinRequests,
    acceptJoinRequest: clanService.acceptJoinRequest,
    declineJoinRequest: clanService.declineJoinRequest,
    cancelJoinRequest: clanService.cancelJoinRequest,
  },
  dailyRewards: {
    list: dailyRewardsService.getDailyRewards,
    claim: dailyRewardsService.claimDailyReward,
    claimAll: dailyRewardsService.claimAllDailyRewards,
  },
  feed: {
    searchUsers: feedService.searchUsers,
    list: feedService.getFeed,
    hashtag: feedService.getHashtagFeed,
    detail: feedService.getFeedEvent,
    createPost: feedService.createPost,
    updatePost: feedService.updatePost,
    deletePost: feedService.deletePost,
    react: feedService.reactFeed,
    unreact: feedService.unreactFeed,
    reactors: feedService.getReactors,
    comments: feedService.getFeedComments,
    createComment: feedService.createComment,
  },
  friendship: {
    request: friendshipService.sendFriendRequest,
    accept: friendshipService.acceptFriendRequest,
    decline: friendshipService.declineFriendRequest,
    listFriends: friendshipService.getFriends,
    listRequests: friendshipService.getFriendRequests,
    unfriend: friendshipService.unfriend,
    block: friendshipService.blockUser,
    unblock: friendshipService.unblockUser,
  },
  leaderboards: {
    board: leaderboardsService.getLeaderboard,
    history: leaderboardsService.getLeaderboardHistory,
    scopes: leaderboardsService.getLeaderboardScopes,
  },
  legion: {
    list: legionService.getLegions,
    detail: legionService.getLegion,
    join: legionService.joinLegion,
  },
  legionLeaderboard: {
    board: legionLeaderboardService.getLegionLeaderboard,
  },
  legionTreasury: {
    detail: legionTreasuryService.getLegionTreasury,
    donate: legionTreasuryService.donateToTreasury,
    leader: legionTreasuryService.getLegionLeader,
    proposeStandard: legionTreasuryService.proposeStandard,
    proposeWarRoom: legionTreasuryService.proposeWarRoom,
    proposals: legionTreasuryService.getStandardProposals,
    vote: legionTreasuryService.voteStandardProposal,
  },
  missions: {
    list: missionsService.getMissions,
    detail: missionsService.getMission,
    available: missionsService.getAvailableMissions,
    recommended: missionsService.getRecommendedMissions,
    dailyBriefing: missionsService.getDailyBriefing,
    start: missionsService.startMission,
    abandon: missionsService.abandonMission,
    rewardedVideo: missionsService.registerRewardedVideo,
    complete: missionsService.completeMission,
    toReview: missionsService.getMissionsToReview,
    approve: missionsService.approveMission,
    reject: missionsService.rejectMission,
    favorite: missionsService.favoriteMission,
    unfavorite: missionsService.unfavoriteMission,
    favorites: missionsService.getFavoriteMissions,
  },
  notifications: {
    list: notificationsService.getNotifications,
    unreadCount: notificationsService.getUnreadNotificationsCount,
    markRead: notificationsService.markNotificationRead,
    markAllRead: notificationsService.markAllNotificationsRead,
  },
  physical: {
    catalog: physicalService.getProducts,
    redeem: physicalService.redeemProduct,
  },
  presence: {
    get: presenceService.getMyPresence,
    set: presenceService.setMyPresence,
  },
  professions: {
    catalog: professionsService.getProfessions,
    owned: professionsService.getUserProfessions,
    buy: professionsService.buyProfession,
  },
  provinces: {
    list: provincesService.getProvinces,
    updateUserProvince: provincesService.updateUserProvince,
  },
  quiz: {
    resendCode: quizService.resendTestCode,
    questions: quizService.getQuizQuestions,
    submit: quizService.submitQuizAnswers,
  },
  ranking: {
    list: rankingService.getRanking,
  },
  ranks: {
    tracks: ranksService.getTracks,
    chooseTrack: ranksService.chooseTrack,
    list: ranksService.getRanks,
  },
  rewards: {
    grant: rewardsService.grantReward,
    usage: rewardsService.getRewardsUsage,
  },
  search: {
    global: searchService.globalSearch,
  },
  specialties: {
    list: specialtiesService.getSpecialties,
  },
  streak: {
    get: streakService.getStreak,
    buyShield: streakService.buyStreakShield,
  },
  tributes: {
    feed: tributesService.sendFeedTribute,
    mission: tributesService.sendMissionTribute,
  },
  upload: {
    media: uploadService.uploadMedia,
  },
  users: {
    profile: usersService.getUserProfile,
    stats: usersService.getUserStats,
    summary: usersService.getUserSummary,
  },
  wallet: {
    balance: walletService.getWallet,
  },
};

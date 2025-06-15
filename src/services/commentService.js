import {userService} from './userService';

export const commentService = {
    createComment(recipeId, commentContent, userId) {
        const newComment = {
            commentId: 'comment-' + Date.now(),
            recipeId,
            userId,
            username: userService.getUserName(userId),
            avatar: userService.getUserAvatar(userId),
            content: commentContent,
            createdAt: new Date().toISOString().slice(0, 10),
        };
        return newComment;
    }
};

import mockData from '@/utils/mock-data';
import { userService } from './userService';

class CommentService {
    constructor() {
        this.reviews = JSON.parse(JSON.stringify(mockData.reviews));
    }

    // 异步：获取某个食谱的所有评论
    async getCommentsByRecipeId(recipeId) {
        const comments = this.reviews.filter(c => c.RecipeID === recipeId);

        // 使用 Promise.all 并发获取用户信息
        const enrichedComments = await Promise.all(
            comments.map(async c => ({
                ...c,
                userId: c.UserID,
                comment: c.Comment,
                rating: c.Rating,
                reviewTime: c.ReviewTime,
                username: await userService.getUserName(c.UserID),
                avatar: await userService.getUserAvatar(c.UserID),
            }))
        );

        return enrichedComments;
    }

    // 示例：添加评论（同步）
    addComment(recipeId, comment, userId, rating = 0) {
        const newReview = {
            ReviewID: 'review-' + Date.now(),
            RecipeID: recipeId,
            UserID: userId,
            Comment: comment,
            Rating: rating,
            ReviewTime: new Date().toISOString(),
        };
        this.reviews.push(newReview);
        return this.getCommentsByRecipeId(recipeId);
    }
}

export const commentService = new CommentService();

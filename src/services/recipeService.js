import MOCK_DATA from '../utils/mock-data';
import {userService} from './userService';

export const recipeService = {
    async fetchRecipes() {
        await new Promise(res => setTimeout(res, 500)); // 模拟延迟

        const favoriteCounts = MOCK_DATA.collections.reduce((acc, collection) => {
            acc[collection.RecipeID] = (acc[collection.RecipeID] || 0) + 1;
            return acc;
        }, {});

        const recipes = MOCK_DATA.recipes.map(recipe => {
            let coverImage = `https://placehold.co/600x400/cccccc/ffffff?text=${encodeURI(recipe.Title)}`;
            try {
                const images = JSON.parse(recipe.ImageLinks);
                if (images && images.length > 0) {
                    coverImage = images[0];
                }
            } catch (e) {
                console.error(`解析菜谱 ${recipe.RecipeID} 的图片链接时出错:`, e);
            }

            const storyData = MOCK_DATA.stories.find(s => s.RecipeID === recipe.RecipeID);

            return {
                id: recipe.RecipeID,
                title: recipe.Title,
                description: recipe.Description,
                recipetypeid: recipe.RecipetypeId,
                recipetypename: recipe.RecipetypeName,
                ingredients: JSON.parse(recipe.Ingredients),
                steps: JSON.parse(recipe.Steps),
                difficulty: recipe.Difficulty,
                createdAt: recipe.UploadTime,
                authorId: recipe.UserID,
                authorName: userService.getUserName(recipe.UserID),
                coverImage: coverImage,
                likes: Math.floor(Math.random() * 200),
                favorites: favoriteCounts[recipe.RecipeID] || 0,
                status: recipe.Status,
                story: storyData ? `${storyData.HistoricalContext}\n\n${storyData.CulturalSignificance || ''}`.trim() : null,
            };
        });

        const comments = MOCK_DATA.reviews.reduce((acc, review) => {
            const {RecipeID} = review;
            if (!acc[RecipeID]) {
                acc[RecipeID] = [];
            }
            acc[RecipeID].push({
                commentId: review.ReviewID,
                recipeId: review.RecipeID,
                userId: review.UserID,
                username: userService.getUserName(review.UserID),
                content: review.Comment,
                createdAt: review.ReviewTime,
                rating: review.Rating,
            });
            return acc;
        }, {});

        return {recipes, comments};
    }
};

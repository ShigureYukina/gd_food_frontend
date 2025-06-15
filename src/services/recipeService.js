// services/recipeService.js
import MOCK_DATA from '@/utils/mock-data';
import {userService} from './userService';
import {ref} from 'vue'; // <--- 从 Vue 导入 ref

// 将 cachedRecipes 从普通 'let' 变量改为 Vue ref
// 这使其成为一个响应式引用，Vue 组件可以监听它的变化。
const recipesRef = ref([]); // <--- 使用 ref([]) 初始化
const commentsRef = ref({}); // <--- 如果其他地方也需要 comments 的响应性，也将其改为 ref

async function fetchRecipes() {
    await new Promise(res => setTimeout(res, 500));

    const favoriteCounts = MOCK_DATA.collections.reduce((acc, collection) => {
        acc[collection.RecipeID] = (acc[collection.RecipeID] || 0) + 1;
        return acc;
    }, {});

    const fetchedRecipes = await Promise.all( // 使用临时变量来存储映射后的数组
        MOCK_DATA.recipes.map(async recipe => {
            let coverImage = `https://placehold.co/600x400/cccccc/ffffff?text=${encodeURI(recipe.Title)}`;
            try {
                const images = JSON.parse(recipe.ImageLinks);
                if (images?.length > 0) coverImage = images[0];
            } catch (e) {
                console.error(`图片链接解析错误: ${recipe.RecipeID}`, e);
            }

            const storyData = MOCK_DATA.stories.find(s => s.RecipeID === recipe.RecipeID);
            const authorName = await userService.getUserName(recipe.UserID);

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
                authorName: authorName || '未知作者',
                coverImage,
                likes: Math.floor(Math.random() * 200),
                favorites: favoriteCounts[recipe.RecipeID] || 0,
                status: recipe.Status,
                story: storyData
                    ? `${storyData.HistoricalContext}\n\n${storyData.CulturalSignificance || ''}`.trim()
                    : null,
            };
        })
    );

    // ***关键一步：更新 ref 的 .value***
    recipesRef.value = fetchedRecipes;

    const fetchedComments = {}; // 使用临时变量存储评论
    await Promise.all(
        MOCK_DATA.reviews.map(async review => {
            if (!fetchedComments[review.RecipeID]) fetchedComments[review.RecipeID] = [];

            const username = await userService.getUserName(review.UserID);

            fetchedComments[review.RecipeID].push({
                commentId: review.ReviewID,
                recipeId: review.RecipeID,
                userId: review.UserID,
                username,
                content: review.Comment,
                createdAt: review.ReviewTime,
                rating: review.Rating,
            });
        })
    );
    // ***更新 ref 的 .value***
    commentsRef.value = fetchedComments;

    return {recipes: recipesRef.value, comments: commentsRef.value};
}

function getRecipeById(id) {
    // 访问 recipesRef 的 .value
    return recipesRef.value.find(r => r.id.toString() === id.toString()) || null;
}

async function updateRecipeStatus(recipeId, status) {
    if (!recipeId) return false;
    await new Promise(res => setTimeout(res, 300));
    // 访问 recipesRef 的 .value
    const recipe = recipesRef.value.find(r => r?.id?.toString() === recipeId.toString());
    if (!recipe) return false;
    recipe.status = status;
    return true;
}

export const recipeService = {
    // 直接导出 ref 本身，这样组件可以直接使用 recipeService.recipes.value
    // 或者如果您更喜欢 getter，也可以保留，但内部始终使用 recipesRef.value
    recipes: recipesRef, // <--- 直接导出 ref
    comments: commentsRef, // <--- 也导出 commentsRef

    fetchRecipes,
    getRecipeById,
    updateRecipeStatus,
};
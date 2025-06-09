import Mock from "mockjs/dist/mock";

// --- 1. 生成用户数据 (Users Table) ---
const userCount = 10;
const users = Mock.mock({
    [`list|${userCount}`]: [
        {
            'UserID|+1': 1,

            'Username': '@cword(2, 4)',
            'PasswordHash': /[a-z0-9]{60}/,
            'Email': '@email',
            'RegistrationTime': '@datetime("yyyy-MM-dd")',
            'LastLoginTime': function () {
                // 50% 的概率为 null
                return Math.random() < 0.5 ? null : Mock.mock('@datetime("yyyy-MM-dd")');
            }
        }
    ]
}).list;

// --- 2. 生成食谱数据 (Recipes Table) ---
const recipeCount = 20;
const recipes = [];
for (let i = 0; i < recipeCount; i++) {
    const ingredients = Mock.mock({
        'list|3-8': [
            {
                'name': '@cword(2, 4)',
                'quantity': '@integer(1, 500)克'
            }
        ]
    }).list;

    const steps = Mock.mock({
        'list|3-6': [
            {
                'stepNumber|+1': 1,
                'description': '@csentence(15, 40)',
                // 每个步骤可以有自己的图片
                'image': function () {
                    return Math.random() < 0.7 ? Mock.mock('@image("800x600", "@color", "#FFF", "Step ' + this.stepNumber + '")') : null;
                }
            }
        ]
    }).list;

    const imageLinks = Mock.mock({
        'list|1-5': ['@image("1920x1080", "@color", "#FFF", "Recipe Image")']
    }).list;


    const recipe = {
        'RecipeID': i + 1,
        // 从已生成用户中随机选择一个作者
        'UserID': Mock.Random.pick(users).UserID,
        'Title': Mock.Random.ctitle(5, 15),
        'Description': Mock.Random.cparagraph(1),
        // --- FIX END ---
        // 根据表结构，将食材和步骤存储为 JSON 字符串
        'Ingredients': JSON.stringify(ingredients),
        'Steps': JSON.stringify(steps),
        'Difficulty': Mock.Random.pick(['简单', '中等', '困难']),
        'VideoLink': function () {
            return Math.random() < 0.3 ? 'https://www.example.com/video/' + Mock.Random.word(10) : null;
        },
        // 存储多张图片的链接为 JSON 字符串
        'ImageLinks': JSON.stringify(imageLinks),
        'UploadTime': Mock.Random.datetime("yyyy-MM-dd"),
    };
    recipes.push(recipe);
}


// --- 3. 生成故事数据 (Stories Table) ---
const stories = recipes.map(recipe => {
    // 假设每个食谱都有一个故事
    return Mock.mock({
        'StoryID|+1': 1,
        'RecipeID': recipe.RecipeID,
        'HistoricalContext': '@cparagraph(3, 7)',
        'CulturalSignificance': function () {
            return Math.random() < 0.6 ? Mock.mock('@cparagraph(2, 5)') : null;
        }
    });
});


// --- 4. 生成评价数据 (Reviews Table) ---
const reviews = [];
// 为每个食谱生成 0 到 8 条不等的评价
recipes.forEach(recipe => {
    const reviewCount = Mock.Random.integer(0, 8);
    for (let i = 0; i < reviewCount; i++) {
        reviews.push(Mock.mock({
            'ReviewID|+1': (reviews.length + 1),
            // 从已生成用户中随机选择一个评价者
            'UserID': Mock.Random.pick(users).UserID,
            'RecipeID': recipe.RecipeID,
            'Rating': '@integer(1, 5)',
            'Comment': function () {
                return Math.random() < 0.85 ? Mock.mock('@csentence(10, 50)') : null;
            },
            'ReviewTime': '@datetime("yyyy-MM-dd")'
        }));
    }
});


// --- 5. 生成收藏数据 (Collections Table) ---
const collections = [];
const collectionSet = new Set(); // 用于确保 (UserID, RecipeID) 组合的唯一性

// 每个用户可以收藏 0 到 15 个不等的食谱
users.forEach(user => {
    const collectionCount = Mock.Random.integer(0, Math.floor(recipeCount / 2));
    const shuffledRecipes = Mock.Random.shuffle([...recipes]); // 打乱食谱顺序以实现随机收藏

    for (let i = 0; i < collectionCount && i < shuffledRecipes.length; i++) {
        const recipe = shuffledRecipes[i];
        const uniqueKey = `${user.UserID}-${recipe.RecipeID}`;

        if (!collectionSet.has(uniqueKey)) {
            collections.push(Mock.mock({
                'UserID': user.UserID,
                'RecipeID': recipe.RecipeID,
                'CollectionTime': '@datetime("yyyy-MM-dd")',
                'Notes': function () {
                    return Math.random() < 0.4 ? Mock.mock('@csentence(5, 20)') : null;
                }
            }));
            collectionSet.add(uniqueKey);
        }
    }
});


// --- 导出所有模拟数据 ---
const mockData = {
    users,
    recipes,
    stories,
    reviews,
    collections
};

export default mockData;

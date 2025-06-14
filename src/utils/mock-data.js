import Mock from "mockjs/dist/mock";

// --- 1. 生成用户数据 (Users Table) ---

// 定义一个固定的管理员用户
const adminUser = {
    'UserID': 0,
    'Username': 'Admin',
    'Password': 'admin',
    'Email': 'admin@example.com',
    'RegistrationTime': '2023-01-01',
    'LastLoginTime': Mock.mock('@now("yyyy-MM-dd")'),
    'Avatar': 'https://i.pravatar.cc/150?u=admin',
    'Bio': '网站的官方管理员账户。',
    'Followers': 9999,
    'RecipesPublished': 5, // 假设管理员也发布了一些内容
    'isAdmin': true // 添加一个管理员标识
};

// 生成普通用户
const userCount = 49; // 生成 49 个普通用户，加上管理员共 50 个
const regularUsers = Mock.mock({
    [`list|${userCount}`]: [
        {
            'isAdmin': false,
            'UserID|+1': 1,
            'Username': '@cword(2, 4)', // 中文用户名
            'Password': /[a-z][0-10](10)/,
            'Email': '@email',
            'RegistrationTime': '@datetime("yyyy-MM-dd")',
            'LastLoginTime': function () {
                return Math.random() < 0.5 ? null : Mock.mock('@datetime("yyyy-MM-dd")');
            },
            'Avatar': function () {
                // 使用 UserID 确保每个用户头像唯一
                return `https://i.pravatar.cc/150?u=${this.UserID}`;
            },
            'Bio': '@csentence(10, 30)', // 简介
            'Followers|0-1000': 1, // 关注者数量
        }
    ]
}).list;

// 将管理员和普通用户合并
const users = [adminUser, ...regularUsers];


// --- 2. 生成食谱数据 (Recipes Table) ---
const recipeCount = 50;
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
        'RecipeID': i + 1, // 食谱的唯一ID，这里是递增的
        'CoverImage': Mock.Random.pick(imageLinks), // 食谱封面图片，从预生成的图片链接池中随机选择一个
        'UserID': Mock.Random.pick(users).UserID, // 食谱创建者的用户ID，从现有用户中随机选择
        'Title': Mock.Random.ctitle(5, 15), // 食谱标题，5到15个中文字符
        'Description': Mock.Random.cparagraph(1), // 食谱描述，1个中文段落
        'Ingredients': JSON.stringify(ingredients), // 食谱所需食材，将 'ingredients' 对象转换为 JSON 字符串
        'RecipetypeId': Mock.Random.pick([1, 2, 3, 4, 5]), // 食谱类型ID，随机选择
        'RecipetypeName': Mock.Random.pick(['西餐', '中餐', '面食', '粥类', '汤类']), // 食谱类型名称
        'Steps': JSON.stringify(steps), // 食谱步骤，将 'steps' 对象转换为 JSON 字符串
        'Difficulty': Mock.Random.pick(['简单', '中等', '困难']), // 烹饪难度
        // --- 新增字段 ---
        'Status': Mock.Random.pick(['pending', 'approved', 'rejected']), // 食谱审核状态：待处理、已通过、已拒绝
        'VideoLink': function () { // 可选的视频链接，约30%的食谱会有视频
            return Math.random() < 0.3 ? 'https://www.example.com/video/' + Mock.Random.word(10) : null;
        },
        'ImageLinks': JSON.stringify(imageLinks), // 食谱相关图片链接，将 'imageLinks' 数组转换为 JSON 字符串
        'UploadTime': Mock.Random.datetime("yyyy-MM-dd"), // 食谱上传时间
    };
    recipes.push(recipe);
}


// --- 3. 生成故事数据 (Stories Table) ---
const stories = recipes.map(recipe => {
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
recipes.forEach(recipe => {
    // Generate a random number of reviews for each recipe (between 0 and 8)
    const reviewCount = Mock.Random.integer(0, 8);
    for (let i = 0; i < reviewCount; i++) {
        reviews.push(Mock.mock({
            'ReviewID|+1': (reviews.length + 1), // Incremental ReviewID
            'UserID': Mock.Random.pick(users).UserID, // Randomly pick a UserID from existing users
            'RecipeID': recipe.RecipeID, // Associate the review with the current recipe
            'Rating': '@integer(1, 5)', // Random rating between 1 and 5
            'Comment': function () {
                // Randomly generate a comment or return null
                return Math.random() < 0.85 ? Mock.mock('@csentence(10, 50)') : null;
            },
            'ReviewTime': '@datetime("yyyy-MM-dd")' // Generate review time
        }));
    }
});


// --- 5. 生成收藏数据 (Collections Table) ---
const collections = [];
const collectionSet = new Set();
users.forEach(user => {
    // 为每个用户生成收藏数量，最多为食谱总数的一半
    const collectionCount = Mock.Random.integer(0, Math.floor(recipeCount / 2));
    // 随机打乱所有现有食谱
    const shuffledRecipes = Mock.Random.shuffle([...recipes]);

    // 遍历打乱后的食谱，为当前用户添加收藏
    for (let i = 0; i < collectionCount && i < shuffledRecipes.length; i++) {
        const recipe = shuffledRecipes[i]; // <--- 关键点：这里从现有食谱中获取
        const uniqueKey = `${user.UserID}-${recipe.RecipeID}`;

        // 确保不会重复收藏同一个食谱
        if (!collectionSet.has(uniqueKey)) {
            collections.push(Mock.mock({
                'UserID': user.UserID,
                'RecipeID': recipe.RecipeID, // <--- 关键点：这里使用的是现有食谱的 ID
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

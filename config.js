const configurations = {
    // 功能标签页
    tabs: [
        {
            name: "coins",
            component: "gh-coins",
            label: "抛硬币正面朝上",
        },
        {
            name: "hundred",
            component: "gh-hundred",
            label: "100次实验，成功次数的概率分布",
        },
        {
            name: "binomial",
            component: "gh-binomial",
            label: "二项分布基础概念",
        },
        {
            name: "jointdensity",
            component: "gh-jointdensity",
            label: "联合概率密度",
        },
    ]
}


const testData = [
    [
        {
            datas: [1, 7],
            offset: 0
        },
        {
            datas: [3, 1, 6, 2, 4, 3, 1, 6, 2, 4, 5],
            offset: 0
        }
    ],
    [
        {
            datas: [1, 3],
            offset: 0
        }
    ]
]

const {
    client,
    getAllUsers,
    createUser,
    updateUser,
    createPost,
    updatePost,
    getAllPosts,
    getPostsByUser,
    getUserById
} = require('./index');

async function dropTables() {
    try {
        console.log('Starting to drop tables...');
        await client.query(`
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS users;
        `);
    } catch (error) {
        console.error('Error dropping tables!');
        throw error;
    }
};

async function createTables() {
    try {
        console.log('Starting to build tables...');
        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                active BOOLEAN DEFAULT true
            );
        `);
        await client.query(`
            CREATE TABLE posts (
                id SERIAL PRIMARY KEY,
                "authorId" INTEGER REFERENCES users(id) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                active BOOLEAN DEFAULT true
            );
    `);
        console.log('Finished building tables!');
    } catch (error) {
        console.error('Error building tables!');
        throw error;
    }
};

async function createInitialUsers() {
    try {
        console.log('Starting to create users...');
        const albert = await createUser({username: 'albert', password: 'bertie99', name: 'Albert', location: 'San Diego'});
        const sandra = await createUser({username: 'sandra', password: '2sandy4me', name: 'Sandra', location: 'Austin'});
        const glamgal = await createUser({username: 'glamgal', password: 'soglam', name: 'Betty', location: 'Riverdale'});
        console.log('Finished creating users!');
    } catch (error) {
        console.error('Error creating users!');
        throw error;
    }
};

async function createInitialPosts() {
    try {
        const [albert, sandra, glamgal] = await getAllUsers();
    
        await createPost({
            authorId: albert.id,
            title: "First Post",
            content: "This is my first post. I hope I love writing blogs as much as I love writing them."
        });

        await createPost({
            authorId: sandra.id,
            title: "Love posting stuff",
            content: "I'm super great at posting. It's all I ever do in life!"
        });

        await createPost({
            authorId: sandra.id,
            title: "The proof!",
            content: "This is just an additional note to prove I like posting stuff."
        });

        await createPost({
            authorId: glamgal.id,
            title: "Hello world",
            content: "I've barely written any posts at all. I'm something of a lurker, I guess. I like to read but don't like writing them."
        });
    } catch (error) {
        throw error;
    }
};

async function rebuildDB() {
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialPosts();
    } catch (error) {
        throw error;
    }
};

async function testDB() {
    try {
        console.log('Starting to test database.');

        console.log("Calling getAllUsers");
        const users = await getAllUsers();
        console.log('Result:', users);

        console.log("Calling updateUser on users[0]");
        const updateUserResult = await updateUser(users[0].id, {
            name: "Newname Sogood",
            location: "Lesterville, KY"
        });
        console.log("Result:", updateUserResult);

        console.log("Calling getAllPosts");
        const posts = await getAllPosts();
        console.log("Result:", posts);
    
        console.log("Calling updatePost on posts[0]");
        const updatePostResult = await updatePost(posts[0].id, {
          title: "New Title",
          content: "Updated Content"
        });
        console.log("Result:", updatePostResult);
    
        console.log("Calling getUserById with 1");
        const albert = await getUserById(1);
        console.log("Result:", albert);

        console.log('Finished database tests!');
    } catch (error) {
        console.error('Error testing database!');
        throw error;
    }
};



rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());
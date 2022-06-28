# Extending and Building Custom Resolvers with Strapi v4

![Building Custom Resolvers with Strapi](https://d2zv2ciw0ln4h1.cloudfront.net/uploads/Snipcart_Strapi_6_6705388080.png)

In recent years there has been a consistent rise in demand for headless solutions, from e-commerce to content management. We will focus on Strapi, an open-source headless CMS, and break down how to quickly build and customize tailored headless CMS solutions.

In this article, you will learn:

- How to install and set up the Strapi GraphQL plugin
- Concepts like resolvers, mutations, and queries in the context of GraphQL
- How to customize Strapi's GraphQL backend with custom resolvers for queries and mutations

## Headless CMS

The term _headless_ comes from the idea of chopping the head (the frontend) from the body (the backend). A headless CMS is focused on storing and delivering structured content—it doesn't really care where and how the content is displayed.

Headless CMS systems have many uses, including:

- Building websites and applications with any JavaScript framework (Next.js, React, Vue, Angular)
- Providing content for static site generators (Gatsby, Jekyll, Hugo)
- Mobile applications (iOS, Android, React Native)
- Enriching product information on e-commerce sites

### Strapi

> Strapi is an open-source, Node.js-based headless CMS that saves developers time while giving them freedom to use their favorite tools and frameworks. Strapi also enables content editors to streamline content delivery (text, images, video, etc.) across any device. – [Strapi | What is Strapi](https://strapi.io/faq)

Strapi offers the following advantages:

- **Open source:** Available in GitHub and supported by hundreds of contributors.
- **Self-hosted:** Gives you full control of your data and privacy.
- **Customizable:** Via admin panel or directly extending with plugins and customizations.
- **Flexible:** Consume it from any client, SPA, or mobile app, as well as via REST or GraphQL.

### GraphQL

> GraphQL is an open-source data query and manipulation language for APIs and a runtime for fulfilling queries with existing data. GraphQL was developed internally by Facebook in 2012 before being publicly released in 2015. – [Wikipedia](https://en.wikipedia.org/wiki/GraphQL)

Unlike REST, GraphQL allows you to retrieve only the content needed. This gives the client a lot more freedom, resulting in much faster development compared to REST.

## Implementing the Basic Solution

For this article, let’s use one of the many [Strapi Starters](https://strapi.io/starters) as your starting point. You’ll then customize it to suit your needs, in this case with the [NextJS Blog Starter](https://strapi.io/starters/strapi-starter-next-js-blog).

Start by creating a brand-new project:

```bash
    npx create-strapi-starter graphql-blog next-blog --quickstart
    cd graphql-blog
```

Next, validate that the Strapi installation worked correctly by running:

```bash
    yarn develop
```

Strapi will require you to generate an admin account on the initial run, like so:

<img width="821" alt="Screen Shot 2022-06-24 at 3 17 55 PM" src="https://user-images.githubusercontent.com/6153188/175760631-ebbee0f1-3365-4d5a-a68b-b62a30ab7add.png">

Next, you should be able to see your Strapi admin fully set up in the context of blog:

<img width="1511" alt="Screen Shot 2022-06-24 at 3 21 13 PM" src="https://user-images.githubusercontent.com/6153188/175760638-a3c86427-ac75-4a0a-9389-8d7671b7e07c.png">

This starter should have GraphQL installed by default, If not. You can easily enable GraphQL support directly from the Strapi admin:

- Go to **Marketplace**.
- Find the GraphQL plugin
- Click **Copy install command** on the GraphQL plugin.

<img width="1505" alt="2022-06-24_15-25-08" src="https://user-images.githubusercontent.com/6153188/175760728-572c6af0-4602-46f4-aac9-26a3c723b867.png">

In your terminal paste the command, install and restart.

You can manually restart the server to make sure the GraphQL plugin is fully initialized—you can do this from the terminal as before:

```bash
    yarn develop
```

Once the server has restarted, you can test your new GraphQL API by opening the GraphQL playground: `localhost:1337/graphql`.

Next, type the following query to validate that you can retrieve articles:

```
query {
  articles {
    data {
      id
      attributes {
        title
        description
      }
    }
  }
}

```

You should see the results on the right:

<img width="1510" alt="Screen Shot 2022-06-24 at 3 34 11 PM" src="https://user-images.githubusercontent.com/6153188/175760762-b8ff32e5-2f62-4dba-8470-f42fce56d82b.png">

By default, the Strapi GraphQL plugin has [Shadow CRUD](https://docs.strapi.io/developer-docs/latest/plugins/graphql.html#shadow-crud) enabled, a useful feature eliminating the need to specify any definitions, queries, mutations, or anything else.

Shadow CRUD will automatically generate everything needed to start using GraphQL based on your existing models. However, this auto-generated implementation might not be enough for every use case. It’s likely you’ll have to customize your queries and mutations for your specific use case.

Next, let's look at how you can use custom resolvers to customize both your queries and mutations.

## Resolvers

Resolvers are functions that resolve a value for a type or a field in a schema. You can also define custom resolvers to handle custom queries and mutations.

Unlike Strapi v3, where we wrote our custom resolvers in the `schema.graphql.js` file, things in v4 look slightly different.

## v3/v4 comparison

In Strapi v3, GraphQL resolvers are either automatically bound to REST controllers (from the core API) or customized using the `./api/<api-name>/config/schema.graphql.js` files.

In Strapi v4, [GraphQL](https://docs.strapi.io/developer-docs/latest/plugins/graphql.html) dedicated core resolvers are automatically created for the basic CRUD operations for each API. Additional resolvers can be [customized programmatically](https://docs.strapi.io/developer-docs/latest/plugins/graphql.html#customization) using GraphQL’s extension service, accessible using `strapi.plugin(’graphql’).service(’extension’)`.

You can learn more about the diferences here. [v3/v4 Strapi GraphQl Resolvers](https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/graphql.html#adding-new-definitions)

Let's start with a simple example to learn how to query an article via **_slug_** instead of an **_id_**.

In your GraphQL playground `localhost:1337/graphql` run the following query:

```
	query {
	 	article(id: "1") {
	    data {
	      id
	      attributes {
	        title
	        description
	        content
	      }
	    }
	  }
	}

```

As you can see, we query our article by the id.

<img width="798" alt="2022-06-24_15-55-00" src="https://user-images.githubusercontent.com/6153188/175760786-4e26354b-7352-425a-ad89-655efc3b3c47.png">

And return the following data:

```json
{
  "data": {
    "article": {
      "data": {
        "id": "1",
        "attributes": {
          "title": "What's inside a Black Hole",
          "description": "Maybe the answer is in this article, or not...",
          "content": "Well, we don't know yet..."
        }
      }
    }
  }
}
```

If we query the article via the **_slug_**, it will not work because our current resolver does not yet support this functionality.

<img width="810" alt="Screen Shot 2022-06-24 at 3 59 16 PM" src="https://user-images.githubusercontent.com/6153188/175760795-efc98703-a358-4180-8d73-821afff925b0.png">

Let's look at how we can extend our **_article resolver_** to add this functionality.

## GraphQL’s extension service

We can customize our resolvers by using GraphQL's extension service.

Let's take a look inside our index.js file at `backend/src/index.js`

Normally our file will look like this.

<img width="975" alt="Screen Shot 2022-06-24 at 4 11 12 PM" src="https://user-images.githubusercontent.com/6153188/175760807-9785129c-6fd5-426e-adb0-eaea53457fff.png">

But in our current starter project, it should look like the image below.

<img width="1389" alt="2022-06-24_16-15-24" src="https://user-images.githubusercontent.com/6153188/175760843-7a70e8f5-616b-4f7a-b1fe-a43ea22fa038.png">

We will configure our GraphQl within the register functions, so let's add it back in.

```javascript
    register(/* { strapi } */) {},
```

The complete code should look like this:

```javascript
"use strict";
const boostrap = require("./bootstrap");

module.exports = {
  async bootstrap() {
    await boostrap();
  },

  register(/* { strapi } */) {},
};
```

Let's use GraphQL's extension service to allow us to add our custom resolvers by adding the following to our `index.js` file.

```javascript
"use strict";
const boostrap = require("./bootstrap");

module.exports = {
  async bootstrap() {
    await boostrap();
  },

  register({ strapi }) {
    const extensionService = strapi.service("plugin::graphql.extension");
    extensionService.use(// add extension code here);
  },
};
```

### Extending the schema

The schema generated by the Content API can be extended by registering an extension.

This extension, defined either as an object or a function returning an object, will be used by the `use()` function exposed by the `extension service`  provided with the GraphQL plugin. You can read more [here](https://docs.strapi.io/developer-docs/latest/plugins/graphql.html#extending-the-schema).

The object describing the extension accepts the following parameters:

| Parameter       | Type   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| types           | Array  | Allows extending the schema types using [Nexus](https://nexusjs.org/)-based type definitions                                                                                                                                                                                                                                                                                                                                                                             |
| typeDefs        | String | Allows extending the schema types using [GraphQL SDL](https://graphql.org/learn/schema/)                                                                                                                                                                                                                                                                                                                                                                                 |
| plugins         | Array  | Allows extending the schema using Nexus [plugins](https://nexusjs.org/docs/plugins)                                                                                                                                                                                                                                                                                                                                                                                      |
| resolvers       | Object | Defines custom resolvers                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| resolversConfig | Object | Defines [configuration options for the resolvers](https://docs.strapi.io/developer-docs/latest/plugins/graphql.html#custom-configuration-for-resolvers), such as [authorization](https://docs.strapi.io/developer-docs/latest/plugins/graphql.html#authorization-configuration), [policies](https://docs.strapi.io/developer-docs/latest/plugins/graphql.html#policies) and [middlewares](https://docs.strapi.io/developer-docs/latest/plugins/graphql.html#middlewares) |

You can extend the types using [Nexus](https://nexusjs.org/)or do it via typeDefs using [GraphQL SDL](https://graphql.org/learn/schema/); this is the approach we are going to take here since we can write a whole article on using Nexus.

Before filling out the logic, let's pass the following function into the `use()` method.

```javascript
({ strapi }) => ({
  typeDefs: ``,
  resolvers: {},
});
```

Our completed code should look like this:

```javascript
"use strict";

const boostrap = require("./bootstrap");

module.exports = {
  async bootstrap() {
    await boostrap();
  },

  register({ strapi }) {
    const extensionService = strapi.service("plugin::graphql.extension");

    extensionService.use(({ strapi }) => ({
      typeDefs: ``,
      resolvers: {},
    }));
  },
};
```

We are passing `strapi` so we can access its methods.

- **typeDefs:** allows us to overide or create new def types
- **resolver:**
  - **Query:** section for defining one or more custom query resolvers.
  - **Mutation:** section for defining one or more customer mutation resolvers.
- **resolverConfig:** allows pass additional configuration options

Now that you have a base schema let's add a custom query.

### Queries

> A GraphQL query is used to read or fetch values, while a mutation is used to write or post values. In either case, the operation is a simple string that a GraphQL server can parse and respond to with data in a specific format. – [Tutorialpoints](https://www.tutorialspoint.com/graphql/graphql_query.htm)

For this example,we will overide our `article` query to allow us to to use a **_slug_** instead of an **_id_** to query our data.

Currently, our query definition looks like this:

```javascript
    article(id: ID): ArticleEntityResponse
```

It takes an **id** and returns our **ArticleEntityResponse**, which was automatically generated for us when we created the article content type.

Let's override it to take a **_slug_** vs **_id_**. In our code, add this snippet:

```javascript
  typeDefs: `
    type Query {
      article(slug: String!): ArticleEntityResponse
    }
  `,
```

This query specifies the query name the parameters will take; in this case:

- `article` is the name of our query we are overriding.
- `slug` is the parameter of the type string that is required to be passed in our query.
- `ArticleEntityResponse` is the data that we are returning.

Our completed code should look like this:

```javascript
"use strict";

const boostrap = require("./bootstrap");

module.exports = {
  async bootstrap() {
    await boostrap();
  },

  register({ strapi }) {
    const extensionService = strapi.service("plugin::graphql.extension");

    extensionService.use(({ strapi }) => ({
      typeDefs: `
        type Query {
          article(slug: String!): ArticleEntityResponse
        }
      `,
      resolvers: {},
    }));
  },
};
```

Now in our GraphQl playground we should be able to pass a **_slug_** instead of an **_id_** in our **_article query_**:

<img width="1512" alt="2022-06-24_23-04-03" src="https://user-images.githubusercontent.com/6153188/175760942-9cfcb635-7b33-4fe6-883e-75c2a83bd846.png">

However, if you attempt to run your query right now, it will not work.

This makes perfect sense since you’ve only specified the new query type you want to override, but not how to _resolve_ that query and return data. This is where resolvers come into play.

We now have to override our resolver to expect a **_slug_** as a parameter and write custom logic to allow us to return the correct data.

Let's create our resolver and then review the code and what it does.

When defining resolvers, you have two options. You can override an existing controller or create a fully custom one. In this case, we will override our `article` resolver.

Add the following code into your custom schema.

```javascript
	resolvers: {
	  Query: {
	    article: {
	      resolve: async (parent, args, context) => {

	        const { toEntityResponse } = strapi.service(
	          "plugin::graphql.format"
	        ).returnTypes;

	        const data = await strapi.services["api::article.article"].find({
	          filters: { slug: args.slug },
	        });

	        const response = toEntityResponse(data.results[0]);

	        console.log("##################", response, "##################");

	        return response;
	      },
	    },
	  },
	},
```

Our completed code should look like this:

```javascript
"use strict";
const boostrap = require("./bootstrap");

module.exports = {
  async bootstrap() {
    await boostrap();
  },

  register({ strapi }) {
    const extensionService = strapi.service("plugin::graphql.extension");
    extensionService.use(({ strapi }) => ({
      typeDefs: `
        type Query {
          article(slug: String!): ArticleEntityResponse
        }
      `,
      resolvers: {
        Query: {
          article: {
            resolve: async (parent, args, context) => {
              const { toEntityResponse } = strapi.service(
                "plugin::graphql.format"
              ).returnTypes;

              const data = await strapi.services["api::article.article"].find({
                filters: { slug: args.slug },
              });

              const response = toEntityResponse(data.results[0]);

              console.log("##################", response, "##################");

              return response;
            },
          },
        },
      },
    }));
  },
};
```

Once you have saved the changes to your schema, restart the server and run `yarn develop` again to make sure the changes are reflected, and run the following query below.

```
	query {
	 	article(slug: "what-s-inside-a-black-hole") {
	    data {
	      id
	      attributes {
	        title
	        description
	        content
	        slug
	      }
	    }
	  }
	}

```

Success! We extended a resolver and now your query returning data based on the **_slug_**.

<img width="1512" alt="Screen Shot 2022-06-24 at 11 30 53 PM" src="https://user-images.githubusercontent.com/6153188/175760963-31eba200-e4f2-4409-a5b7-f5143e6f03e0.png">

Let's quickly review what each piece of our code does.

We get the `toEntityResponse` method to allow us to convert our response to the appropriate format before returning the data.

```javascript
const { toEntityResponse } = strapi.service(
  "plugin::graphql.format"
).returnTypes;
```

Instead of our resolvers being tied to controllers like they were in Strapi v3, in v4, we call our services directly. In this case, we are calling a service that was auto-generated for us when we created our `article` content type, but we can create custom services if we choose.

```javascript
const data = await strapi.services["api::article.article"].find({
  filters: { slug: args.slug },
});
```

Finally, we call our `toEntityResponse` to convert our response to the appropriate format before returning the data.

```javascript
const response = toEntityResponse(data.results[0]);
return response;
```

We just took a look at how to override an existing resolver. Let's now look at how we can create a custom GraphQL query resolver from scratch.

## Create a custom GraphQL resolver

We will follow simmilar steps as before. Let's create a placeholder schema object that will include the following:

- **typeDefs:** allows us to overide or create new def types
- **resolver:**
  - **Query:** section for defining one or more custom query resolvers
- **resolverConfig:** allows pass additional configuration options

Paste the following in your code:

```javascript
// Going to be our custom query resolver to get all authors and their details.
extensionService.use(({ strapi }) => ({
  typeDefs: ``,
  resolvers: {},
  resolversConfig: {},
}));
```

Our completed code should look like this:

```javascript
"use strict";

const boostrap = require("./bootstrap");

module.exports = {
  async bootstrap() {
    await boostrap();
  },

  register({ strapi }) {
    const extensionService = strapi.service("plugin::graphql.extension");

    // Previous code from before
    extensionService.use(({ strapi }) => ({}));

    // Going to be our custom query resolver to get all authors and their details.
    extensionService.use(({ strapi }) => ({
      typeDefs: ``,
      resolvers: {},
      resolversConfig: {},
    }));
  },
};
```

Let's define our query and type definitions.

```javascript
  typeDefs: `
    type Query {
      authorsContacts: [AuthorContact]
    }

    type AuthorContact {
      id: ID
      name: String
      email: String
      articles: [Article]
    }
  `,
```

Let's define our resolver.

```javascript
  resolvers: {
    Query: {
      authorsContacts: {
        resolve: async (parent, args, context) => {

          const data = await strapi.services["api::writer.writer"].find({
            populate: ["articles"],
          });

          return data.results.map(author => ({
            id: author.id,
            name: author.name,
            email: author.email,
            articles: author.articles,
          }));

        }
      }
    },
  },
```

Let's define configurations to allow us public access when making the request.

```javascript
  resolversConfig: {
    "Query.authorsContacts": {
      auth: false,
    },
  },
```

Our completed code should look like this:

```javascript
"use strict";

const boostrap = require("./bootstrap");

module.exports = {
  async bootstrap() {
    await boostrap();
  },

  register({ strapi }) {
    const extensionService = strapi.service("plugin::graphql.extension");

    // Previous code from before
    extensionService.use(({ strapi }) => ({}));

    // Code we just added - custom graphql resolver
    extensionService.use(({ strapi }) => ({
      typeDefs: `
        
        type Query {
          authorsContacts: [AuthorContact]
        }

        type AuthorContact {
          id: ID
          name: String
          email: String
          articles: [Article]
        }
	    `,

      resolvers: {
        Query: {
          authorsContacts: {
            resolve: async (parent, args, context) => {
              const data = await strapi.services["api::writer.writer"].find({
                populate: ["articles"],
              });

              return data.results.map((author) => ({
                id: author.id,
                name: author.name,
                email: author.email,
                articles: author.articles,
              }));
            },
          },
        },
      },

      resolversConfig: {
        "Query.authorsContacts": {
          auth: false,
        },
      },
    }));
  },
};
```

Let's quickly review what each piece of our code in our custom resolver does.

We get the `services` to fetch our writer data from the database. Then, we pass our populate flag to allow us to populate the article relation data.

```javascript
const data = await strapi.services["api::writer.writer"].find({
  populate: ["articles"],
});
```

Before returning our data, we transform our response to match our `AuthorContact` types definition to be returned in our GraphQl response.

```javascript
return data.results.map((author) => ({
  id: author.id,
  name: author.name,
  email: author.email,
  articles: author.articles,
}));
```

We just took a look at a basic way to create a custom GraphQl resolver inStrapi v4.

Once you have saved the changes to your schema, restart the server and run `yarn develop` again to make sure the changes are reflected, and run the following query below.

```
	query {
	  authorsContacts {
	    id
	    name
	    email
	    articles {
	      title
	      description
	      publishedAt
	    }
	  }
	}
```

You should now see the results from our custom query.

<img width="1510" alt="Screen Shot 2022-06-25 at 12 33 38 AM" src="https://user-images.githubusercontent.com/6153188/175760996-4b1c302c-8010-4e8e-bfc9-6fa3f6fe3f4a.png">

You can verify our newly created query by looking at the [GraphQL Playground](http://localhost:1337/graphql) schema:

<img width="1506" alt="2022-06-25_00-35-08" src="https://user-images.githubusercontent.com/6153188/175761009-0c8c9a1f-c49e-4ffe-8987-2adf1d0d82dc.png">

## There is one big problem

When looking at this code, everything may seem like it is working correctly, but there is an issue here, and it has something to do with passing populate to our find() method.

```javascript
const data = await strapi.services["api::writer.writer"].find({
  populate: ["articles"],
});
```

Whenever we pass `populate,` we will always make an additional call to fetch the **articles** data from the database even if we don't ask for it in our query.

What we need to do, is to create a child resolver to query the articles instead.

## Create child resolver to fetch relations

First, let's refactor our previous code by removing the **articles** reference in AuthorContact:

```javasript
    type AuthorContact {
        id: ID
        name: String
        email: String
        articles: [Article] <-- REMOVE THIS
    }
```

Now let's remove the **populate** argument that we are passing here:

```javasript
    resolvers: {
      Query: {
        authorsContacts: {
          resolve: async (parent, args, context) => {
            const data = await strapi.services["api::writer.writer"].find({
              populate: ["articles"], <-- REMOVE THIS
            });

            return data.results.map((author) => ({
              id: author.id,
              name: author.name,
              email: author.email,
              articles: author.articles, <-- REMOVE THIS
            }));
          },
        },
      },
    },
```

Now your code should look like this:

```javascript
extensionService.use(({ strapi }) => ({
  typeDefs: `

        type Query {
          authorsContacts: [AuthorContact]
        }

        type AuthorContact {
          id: ID
          name: String
          email: String
        }

      `,

  resolvers: {
    Query: {
      authorsContacts: {
        resolve: async (parent, args, context) => {
          const data = await strapi.services["api::writer.writer"].find();

          return data.results.map((author) => ({
            id: author.id,
            name: author.name,
            email: author.email,
          }));
        },
      },
    },
  },

  resolversConfig: {
    "Query.authorsContacts": {
      auth: false,
    },
  },
}));
```

Now let's do things the right way and create a child resolver to fetch articles associated with the author instead.

This way, if we don't ask for the 'articles' in the query, we won't be fetching the data like in our precious example.

Let's define **AuthorsArticles** type and make sure to add it to **AuthorContact** type:

```javasript

      type AuthorsArticles {
        id: ID
        title: String
        slug: String
        description: String
      }

      type AuthorContact {
        id: ID
        name: String
        email: String
        articles: [AuthorsArticles]
      }
```

Now let's create our child resolver to fetch all articles associated with the author:

```javascript
    AuthorContact: {
      articles: {
        resolve: async (parent, args, context) => {

          console.log("#############", parent.id, "#############");

          const data = await strapi.services["api::article.article"].find({
            filters: { author: parent.id },
          });

          return data.results.map((article) => ({
            id: article.id,
            title: article.title,
            slug: article.slug,
            description: article.description,
          }));

        },
      },
    },
```

Our completed code should look like this:

```javascript
"use strict";
const boostrap = require("./bootstrap");

module.exports = {
  async bootstrap() {
    await boostrap();
  },

  register({ strapi }) {
    const extensionService = strapi.service("plugin::graphql.extension");

    // Overriding the default article GraphQL resolver
    extensionService.use(({ strapi }) => ({
      typeDefs: `
        type Query {
          article(slug: String!): ArticleEntityResponse
        }
      `,
      resolvers: {
        Query: {
          article: {
            resolve: async (parent, args, context) => {
              const { toEntityResponse } = strapi.service(
                "plugin::graphql.format"
              ).returnTypes;

              const data = await strapi.services["api::article.article"].find({
                filters: { slug: args.slug },
              });

              const response = toEntityResponse(data.results[0]);

              console.log("##################", response, "##################");

              return response;
            },
          },
        },
      },
    }));

    // Custom query resolver to get all authors and their details.
    extensionService.use(({ strapi }) => ({
      typeDefs: `

        type Query {
          authorsContacts: [AuthorContact]
        }

        type AuthorsArticles {
          id: ID
          title: String
          slug: String
          description: String
        }

        type AuthorContact {
          id: ID
          name: String
          email: String
          articles: [AuthorsArticles]
        }

      `,

      resolvers: {
        Query: {
          authorsContacts: {
            resolve: async (parent, args, context) => {
              const data = await strapi.services["api::writer.writer"].find();

              return data.results.map((author) => ({
                id: author.id,
                name: author.name,
                email: author.email,
              }));
            },
          },
        },

        AuthorContact: {
          articles: {
            resolve: async (parent, args, context) => {

              console.log("#############", parent.id, "#############");

              const data = await strapi.services["api::article.article"].find({
                filters: { author: parent.id },
              });

              return data.results.map((article) => ({
                id: article.id,
                title: article.title,
                slug: article.slug,
                description: article.description,
              }));
            },
          },
        },
      },

      resolversConfig: {
        "Query.authorsContacts": {
          auth: false,
        },
      },
    }));
  },
};
```

We now have a seperate resolver to fetch `articles` that are associated with the author.

Go ahead and run this query:

```
    query {
      authorsContacts {
        id
        name
        email
        articles {
          id
          title
          description
          slug
        }
      }
    }
```

To sum up, when working with GraphQL, you must create a resolver for each related item you want to populate.  
  
Hope you enjoyed this introduction to the the basics of extending and creating custom resolvers with GralhQL in Strapi v4.

## Conclusion

As you can see, [Strapi](https://strapi.io/) provides a highly flexible environment that can be used to create a fully functional content API in minutes. Plus, Strapi allows for full control over the API and system.

Whether you’re looking to create a simple headless content system for your blog or to fully centralize your e-commerce product information, Strapi offers a robust backend.

I hope that you found this tutorial helpful.

If you have any additional questions, join us at our [Discord community](https://discord.com/invite/strapi), where you can ask questions or help other members with theirs.

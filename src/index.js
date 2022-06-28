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


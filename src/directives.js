const { SchemaDirectiveVisitor } = require('apollo-server')
const { defaultFieldResolver, GraphQLString } = require('graphql')
const {formatDate} = require('./utils')

class FormatDateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;
    const {format: defaultFormat} = this.args;

    field.args.push({
      type: GraphQLString,
      name: 'format'
    })

    field.resolve = async (root, {format, ...rest}, ctx, info) => {
      const result = await resolver.call(this, root, rest, ctx, info);

      return formatDate(result, format || defaultFormat)
    }

    field.type = GraphQLString
  }
}

module.exports = {
  FormatDateDirective
}

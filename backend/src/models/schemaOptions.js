function schemaOptions(extra = {}) {
  return {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_document, result) => {
        result.id = result._id.toString();
        delete result._id;
        delete result.passwordHash;
        return result;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_document, result) => {
        result.id = result._id.toString();
        delete result._id;
        delete result.passwordHash;
        return result;
      },
    },
    ...extra,
  };
}

module.exports = { schemaOptions };

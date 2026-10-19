// Compound Class builder: structural composition.
// compose(Base)().part(...).body(...).view(...).build()
export const compose = (Base = class {}) => () => {
  const partDefinitions = [];
  const bodies = [];
  let View = null;

  const builder = {
    part(name, Part) {
      partDefinitions.push([name, Part]);
      return builder;
    },

    body(define) {
      bodies.push(define);
      return builder;
    },

    view(view) {
      View = view;
      return builder;
    },

    build() {
      return class Compound extends Base {
        constructor(...args) {
          super(...args);
          this.parts = {};
          for (const [name, Part] of partDefinitions) {
            this.parts[name] = typeof Part === "function" ? new Part(this) : Part;
          }
          for (const define of bodies) Object.assign(this, define(this) ?? {});
        }

        getPart(name) {
          return this.parts[name];
        }

        render(props = {}) {
          return View ? <View compound={this} {...props} /> : null;
        }
      };
    }
  };

  return builder;
};

// Official Compound Function primitive.
// β receives α and returns γ; γ must call α. `recipe` merely gives the
// construction a name. α is supplied inline at the call site.
export const compoundFunction = (beta) => (alpha) => beta(alpha);

// Daisy-chain constructor. Each `through` is shorthand for a β closure:
// input => alpha(step(part)(input)). build() nests the closures right-to-left.
export const recipe = () => {
  const steps = [];
  const api = {
    through(part, step) {
      steps.push({ part, step });
      return api;
    },
    build(finalAlpha = (value) => value) {
      return steps.reduceRight((alpha, { part, step }) => {
        const transform = step(part);
        return (input) => alpha(transform(input));
      }, finalAlpha);
    }
  };
  return api;
};

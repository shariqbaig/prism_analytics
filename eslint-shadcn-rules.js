/**
 * ESLint plugin for Shadcn/UI component compliance
 * Enforces best practices and consistent patterns for Shadcn components
 */

export const shadcnRules = {
  'shadcn-import-order': {
    create(context) {
      return {
        ImportDeclaration(node) {
          const source = node.source.value;
          const importLine = node.loc.start.line;
          
          // Check for proper import order in component files
          if (source.includes('@/components/ui/')) {
            const sourceCode = context.getSourceCode();
            const imports = sourceCode.getAllComments().concat(sourceCode.ast.body)
              .filter(node => node.type === 'ImportDeclaration')
              .map(node => ({
                source: node.source.value,
                line: node.loc.start.line
              }));
            
            // React imports should come first
            const reactImports = imports.filter(imp => 
              imp.source === 'react' || imp.source.startsWith('react/')
            );
            
            const shadcnImports = imports.filter(imp => 
              imp.source.includes('@/components/ui/')
            );
            
            if (reactImports.length > 0 && shadcnImports.length > 0) {
              const lastReactLine = Math.max(...reactImports.map(imp => imp.line));
              const firstShadcnLine = Math.min(...shadcnImports.map(imp => imp.line));
              
              if (firstShadcnLine < lastReactLine) {
                context.report({
                  node,
                  message: 'Shadcn UI imports should come after React imports'
                });
              }
            }
          }
        }
      };
    }
  },

  'shadcn-component-structure': {
    create(context) {
      return {
        FunctionDeclaration(node) {
          // Check if this is a React component
          if (node.id && /^[A-Z]/.test(node.id.name)) {
            checkComponentStructure(context, node);
          }
        },
        VariableDeclarator(node) {
          // Check arrow function components
          if (node.id && node.id.name && /^[A-Z]/.test(node.id.name) &&
              node.init && node.init.type === 'ArrowFunctionExpression') {
            checkComponentStructure(context, node.init);
          }
        }
      };
      
      function checkComponentStructure(context, node) {
        const sourceCode = context.getSourceCode();
        const text = sourceCode.getText(node);
        
        // Check for proper loading state pattern
        if (text.includes('loading') && !text.includes('Skeleton')) {
          context.report({
            node,
            message: 'Components with loading prop should use Shadcn Skeleton component'
          });
        }
        
        // Check for cn() utility usage
        if (text.includes('className') && !text.includes('cn(')) {
          context.report({
            node,
            message: 'Use cn() utility for className merging in Shadcn components'
          });
        }
      }
    }
  },

  'shadcn-semantic-colors': {
    create(context) {
      return {
        Literal(node) {
          if (typeof node.value === 'string') {
            // Check for hardcoded colors instead of semantic tokens
            const hardcodedColors = [
              /text-gray-\d+/, /bg-gray-\d+/, /border-gray-\d+/,
              /text-blue-\d+/, /bg-blue-\d+/, /border-blue-\d+/,
              /text-red-\d+/, /bg-red-\d+/, /border-red-\d+/,
              /text-green-\d+/, /bg-green-\d+/, /border-green-\d+/,
              /text-yellow-\d+/, /bg-yellow-\d+/, /border-yellow-\d+/
            ];
            
            const hasHardcodedColor = hardcodedColors.some(regex => 
              regex.test(node.value)
            );
            
            if (hasHardcodedColor) {
              context.report({
                node,
                message: 'Use semantic color tokens instead of hardcoded colors (e.g., text-foreground, bg-background)'
              });
            }
          }
        }
      };
    }
  },

  'shadcn-prop-interface': {
    create(context) {
      return {
        TSInterfaceDeclaration(node) {
          if (node.id.name.endsWith('Props')) {
            let hasClassName = false;
            let hasChildren = false;
            
            node.body.body.forEach(property => {
              if (property.key && property.key.name === 'className') {
                hasClassName = true;
              }
              if (property.key && property.key.name === 'children') {
                hasChildren = true;
              }
            });
            
            // Suggest adding common props for component interfaces
            if (!hasClassName) {
              context.report({
                node,
                message: 'Consider adding optional className prop for styling flexibility'
              });
            }
          }
        }
      };
    }
  },

  'shadcn-forwardref-usage': {
    create(context) {
      return {
        CallExpression(node) {
          // Check for React.forwardRef usage in UI components
          if (node.callee.type === 'MemberExpression' &&
              node.callee.object.name === 'React' &&
              node.callee.property.name === 'forwardRef') {
            
            const sourceCode = context.getSourceCode();
            const text = sourceCode.getText(node);
            
            // Check if displayName is set
            const parent = node.parent;
            if (parent && parent.type === 'VariableDeclarator') {
              const componentName = parent.id.name;
              const programBody = context.getSourceCode().ast.body;
              
              const hasDisplayName = programBody.some(statement => 
                statement.type === 'ExpressionStatement' &&
                statement.expression.type === 'AssignmentExpression' &&
                statement.expression.left.type === 'MemberExpression' &&
                statement.expression.left.object.name === componentName &&
                statement.expression.left.property.name === 'displayName'
              );
              
              if (!hasDisplayName) {
                context.report({
                  node,
                  message: `Add displayName to forwardRef component: ${componentName}.displayName = "${componentName}"`
                });
              }
            }
          }
        }
      };
    }
  }
};

export const shadcnConfig = {
  plugins: {
    'shadcn': {
      rules: shadcnRules
    }
  },
  rules: {
    'shadcn/shadcn-import-order': 'warn',
    'shadcn/shadcn-component-structure': 'warn',
    'shadcn/shadcn-semantic-colors': 'error',
    'shadcn/shadcn-prop-interface': 'warn',
    'shadcn/shadcn-forwardref-usage': 'warn'
  }
};
---
name: image-to-vue
version: 1.0.0
description: Convert images to Vue components following unified coding standards. Use when the user wants to transform images (UI designs, icons, screenshots) into Vue components, or when mentioning image-to-code, design-to-vue, or component generation from images.
description_zh: 按照统一编码规范将图片转换为 Vue 组件。当用户想要将图片（UI设计稿、图标、截图）转换为 Vue 组件，或提到图片转代码、设计转 Vue、从图片生成组件时使用。
---

# Image to Vue Component

Convert images into well-structured Vue 3 components following unified coding standards.

## When to Use

- Converting UI design mockups to Vue components
- Transforming icons or images into reusable components
- Recreating page layouts from screenshots or design files
- Generating Vue code from visual references

## Output Standards

### Component Naming
- Use **camelCase** for component names
- Suffix with purpose: `Icon`, `Image`, `Layout`, `Card`, etc.
- Examples: `userAvatarIcon.vue`, `productCardLayout.vue`, `navBar.vue`

### Component Structure

```vue
<template>
  <!-- Semantic HTML structure -->
</template>

<script setup>
// Props definition
// Emits definition
// Composables import
// Reactive state
// Computed properties
// Methods
</script>

<style lang="less" scoped>
/* Component-specific styles using Less */
</style>
```

### Code Style Rules

1. **Use `<script setup>` syntax** - Modern Vue 3 composition API
2. **No TypeScript** - Use plain JavaScript for props and logic
3. **Semantic HTML** - Use appropriate tags (article, section, button vs div)
4. **Less for CSS** - All styles written in Less preprocessor
5. **Props should be readonly** - Never mutate props directly

### Props Definition Template

```javascript
const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: ''
  },
  width: {
    type: [Number, String],
    default: 'auto'
  },
  height: {
    type: [Number, String],
    default: 'auto'
  },
  className: {
    type: String,
    default: ''
  }
})
```

## Conversion Workflow

### Step 0: Check Existing Components (Priority 1)

Before creating a new component, always check for existing solutions:

1. **Search project for similar components**
   - Look for components with similar functionality or structure
   - Check `components/` or `src/components/` directories
   - Search by component type: card, button, modal, etc.
   - If found: reuse or extend the existing component

2. **Check Element Plus library (Priority 2)**
   - Review Element Plus components that match the need
   - Prefer composing existing El-* components over custom implementation
   - Common components to check:
     - Layout: `el-row`, `el-col`, `el-container`
     - Data Display: `el-card`, `el-descriptions`, `el-empty`
     - Form: `el-button`, `el-input`, `el-select`
     - Navigation: `el-menu`, `el-tabs`, `el-breadcrumb`
     - Feedback: `el-dialog`, `el-drawer`, `el-tooltip`

3. **Create custom component (Priority 3)**
   - Only when no existing solution meets the need
   - Follow the layout and styling guidelines below

### Step 1: Analyze the Image

Identify from the image:
- [ ] Component type (icon, card, layout, button, etc.)
- [ ] Visual elements (text, images, icons, buttons)
- [ ] Layout structure (flex, grid, positioning)
- [ ] Colors and typography
- [ ] Interactive elements (hover states, clicks)

### Step 2: Plan the Component

Determine:
- Component name (camelCase)
- Props needed for customization
- Events to emit for interactions
- Slots for flexible content

### Step 3: Generate Vue Code

Follow this structure:

```vue
<template>
  <div class="[component-name]">
    <!-- Image analysis-based structure -->
  </div>
</template>

<script setup>
const props = defineProps({
  // Based on image analysis
})

const emit = defineEmits([
  // Based on interactive elements
])
</script>

<style lang="less" scoped>
.[component-name] {
  /* Based on visual analysis using Less syntax */
}
</style>
```

### Step 4: Add Accessibility

- Include `alt` text for images
- Add `aria-label` for interactive elements
- Ensure keyboard navigation support
- Maintain color contrast ratios

## Examples

### Example 1: Icon Component

**Input**: User avatar icon image (32x32px circle with user silhouette)

**Output**:
```vue
<template>
  <div 
    class="userAvatarIcon"
    :style="{ width: props.size + 'px', height: props.size + 'px' }"
  >
    <img 
      v-if="props.src" 
      :src="props.src" 
      :alt="props.alt"
      class="avatarImage"
    />
    <div v-else class="avatarPlaceholder">
      <UserIcon />
    </div>
  </div>
</template>

<script setup>
import { UserIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: 'User avatar'
  },
  size: {
    type: Number,
    default: 32
  }
})
</script>

<style lang="less" scoped>
.userAvatarIcon {
  border-radius: 50%;
  overflow: hidden;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatarImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatarPlaceholder {
  color: #9ca3af;
}
</style>
```

### Example 2: Product Card Layout (Using Element Plus)

**Input**: E-commerce product card image (image, title, price, button)

**Analysis**: This is a card component with image, text, and button - Element Plus has `el-card` that fits perfectly.

**Output**:
```vue
<template>
  <el-card 
    class="productCard" 
    shadow="hover"
    :body-style="{ padding: '0px' }"
  >
    <el-image 
      :src="props.imageSrc" 
      :alt="props.title"
      fit="cover"
      class="productImage"
    />
    <div class="productInfo">
      <h3 class="productTitle">{{ props.title }}</h3>
      <p class="productPrice">${{ props.price }}</p>
      <el-button 
        type="primary"
        class="addToCartBtn"
        @click="emit('addToCart')"
      >
        Add to Cart
      </el-button>
    </div>
  </el-card>
</template>

<script setup>
const props = defineProps({
  imageSrc: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['addToCart'])
</script>

<style lang="less" scoped>
.productCard {
  // No fixed width - adapts to container
  width: 100%;
  
  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
  }
}

.productImage {
  width: 100%;
  // Use aspect-ratio instead of fixed height
  aspect-ratio: 4 / 3;
}

.productInfo {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.productTitle {
  font-weight: 600;
  font-size: 1.125rem;
  // Flexible text handling
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.productPrice {
  font-size: 1.25rem;
  font-weight: 700;
  color: #16a34a;
}

.addToCartBtn {
  width: 100%;
}
</style>
```

### Example 3: Form Layout (Using Element Plus Grid)

**Input**: Two-column form with inputs and buttons

**Output**:
```vue
<template>
  <el-form class="userForm">
    <el-row :gutter="24">
      <el-col :xs="24" :sm="12">
        <el-form-item label="First Name">
          <el-input v-model="form.firstName" placeholder="Enter first name" />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-form-item label="Last Name">
          <el-input v-model="form.lastName" placeholder="Enter last name" />
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-row :gutter="24">
      <el-col :span="24">
        <el-form-item label="Email">
          <el-input v-model="form.email" type="email" placeholder="Enter email" />
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-form-item>
      <el-button type="primary" @click="handleSubmit">Submit</el-button>
      <el-button @click="handleReset">Reset</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive } from 'vue'

const form = reactive({
  firstName: '',
  lastName: '',
  email: ''
})

const emit = defineEmits(['submit', 'reset'])

const handleSubmit = () => {
  emit('submit', form)
}

const handleReset = () => {
  form.firstName = ''
  form.lastName = ''
  form.email = ''
  emit('reset')
}
</script>

<style lang="less" scoped>
.userForm {
  width: 100%;
  max-width: 600px;
  padding: 24px;
}
</style>
```

## Layout Principles

### Flexible Layout (No Fixed Dimensions)

**Always prefer flexible layouts over fixed dimensions:**

```less
// Good: Flexible sizing
.myComponent {
  width: 100%;           // Fill parent container
  max-width: 1200px;     // Limit maximum width only
  min-height: 200px;     // Minimum height, allows expansion
  padding: 16px;         // Use padding for internal spacing
}

// Bad: Fixed dimensions
.myComponent {
  width: 300px;          // Avoid fixed widths
  height: 200px;         // Avoid fixed heights
}
```

**Use relative units:**
- `%` for widths relative to parent
- `rem`/`em` for spacing and typography
- `vw`/`vh` for viewport-relative sizing (sparingly)
- `min-width`/`max-width` for constraints, not fixed values

### Avoid Absolute Positioning

**Prefer flexbox and grid for layouts:**

```less
// Good: Flexbox layout
.card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// Good: Grid layout
.gridContainer {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

// Bad: Absolute positioning
.component {
  position: absolute;
  top: 10px;
  left: 20px;
  width: 100px;
}
```

**When positioning is necessary, use:**
- `position: relative` for minor adjustments
- `position: sticky` for headers/footers
- CSS Grid or Flexbox for overall layout

### Responsive Considerations

```less
.container {
  width: 100%;
  padding: 16px;
  
  // Use media queries for responsive adjustments
  @media (min-width: 768px) {
    padding: 24px;
  }
  
  @media (min-width: 1024px) {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

## Component Selection Priority

### Priority 1: Project Components

Search patterns to check:
```
src/components/**/*.vue
components/**/*.vue
shared/components/**/*.vue
```

Look for:
- Similar visual patterns
- Same functional purpose
- Reusable base components

**If found:** Import and extend:
```vue
<script setup>
import BaseCard from '@/components/BaseCard.vue'

const props = defineProps({
  // Extend base props
})
</script>
```

### Priority 2: Element Plus Components

**Layout Components:**
```vue
<template>
  <!-- Use el-container for page layout -->
  <el-container>
    <el-header>Header</el-header>
    <el-main>Main content</el-main>
    <el-footer>Footer</el-footer>
  </el-container>
  
  <!-- Use el-row/el-col for grid -->
  <el-row :gutter="20">
    <el-col :span="12">Left</el-col>
    <el-col :span="12">Right</el-col>
  </el-row>
</template>
```

**Common Element Plus Patterns:**

| Visual Pattern | Element Plus Component |
|---------------|----------------------|
| Card with header/footer | `el-card` |
| Form inputs | `el-input`, `el-select`, `el-date-picker` |
| Buttons | `el-button` |
| Tables | `el-table` |
| Dialogs/Modals | `el-dialog` |
| Navigation | `el-menu`, `el-tabs` |
| Lists | `el-list` (or compose with `el-card`) |
| Tags/Badges | `el-tag`, `el-badge` |

**Composing Element Plus:**
```vue
<template>
  <el-card class="productCard" shadow="hover">
    <template #header>
      <div class="cardHeader">
        <span>{{ title }}</span>
        <el-tag v-if="isNew" type="success">New</el-tag>
      </div>
    </template>
    
    <el-image :src="imageSrc" fit="cover" />
    
    <div class="cardFooter">
      <span class="price">${{ price }}</span>
      <el-button type="primary" @click="handleBuy">
        Buy Now
      </el-button>
    </div>
  </el-card>
</template>
```

### Priority 3: Custom Implementation

Only when no existing component fits. Follow all layout principles above.

## Less Style Guidelines

### Variables
Define reusable values at component level:

```less
<style lang="less" scoped>
// Variables
@primary-color: #2563eb;
@border-radius: 8px;
@spacing-unit: 8px;

.componentName {
  color: @primary-color;
  border-radius: @border-radius;
  padding: @spacing-unit * 2;
}
</style>
```

### Nesting
Use Less nesting for better organization:

```less
.card {
  padding: 16px;
  
  .header {
    font-weight: bold;
    
    .title {
      font-size: 18px;
    }
  }
  
  &:hover {
    background-color: #f9fafb;
  }
}
```

### Mixins (Optional)
For repeated patterns:

```less
.flexCenter() {
  display: flex;
  align-items: center;
  justify-content: center;
}

.myComponent {
  .flexCenter();
}
</style>
```

## Common Patterns

### Image Handling
- Use `object-fit: cover` for consistent image sizing
- Implement lazy loading for performance
- Provide fallback/placeholder for failed loads

### Responsive Design
- Use relative units (rem, %, vw/vh)
- Implement mobile-first media queries
- Test at common breakpoints (320px, 768px, 1024px, 1440px)

### Performance
- Use `v-once` for static content
- Implement `v-memo` for list items
- Lazy load heavy components

## Validation Checklist

Before finalizing the component:

### Component Selection
- [ ] Checked for existing similar components in the project
- [ ] Considered Element Plus components before custom implementation
- [ ] Only created custom component when necessary

### Code Quality
- [ ] Component name follows **camelCase** convention
- [ ] Props defined with `defineProps()` using plain JavaScript
- [ ] Emits defined with `defineEmits()` using plain JavaScript
- [ ] Styles use `lang="less"` and `scoped` attributes
- [ ] Accessibility attributes are included
- [ ] Code follows project linting rules
- [ ] Component is self-contained and reusable

### Layout Quality
- [ ] No fixed `width` values (use `%`, `max-width`, or flex/grid)
- [ ] No fixed `height` values (use `min-height` or flex/grid)
- [ ] No absolute positioning (use flexbox or grid instead)
- [ ] Layout is responsive and adapts to container
- [ ] Uses relative units (`%`, `rem`, `em`) for sizing

## Anti-Patterns to Avoid

### Code Patterns
- ❌ Mutating props directly
- ❌ Using TypeScript (lang="ts")
- ❌ Using plain CSS (must use Less)
- ❌ PascalCase component names (use camelCase)
- ❌ Inline styles (use Less classes instead)
- ❌ Deep nesting (keep max 3-4 levels)
- ❌ Mixing v-if and v-for on same element

### Layout Anti-Patterns
- ❌ Fixed widths (`width: 300px`)
- ❌ Fixed heights (`height: 200px`)
- ❌ Absolute positioning (`position: absolute`)
- ❌ Magic numbers for spacing
- ❌ Hard-coded breakpoints without consideration

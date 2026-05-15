<template>
  <div :class="computedClasses" :style="inlineStyles" :data-text="children">
    {{ children }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'

interface GlitchTextProps {
  children: string
  speed?: number
  enableShadows?: boolean
  enableOnHover?: boolean
  /** 亮色页面：主色与伪元素底与字用蓝色系，贴合 #DBDBDB 背景 */
  lightTheme?: boolean
  className?: string
}

interface CustomCSSProperties extends CSSProperties {
  '--after-duration': string
  '--before-duration': string
  '--after-shadow': string
  '--before-shadow': string
}

const props = withDefaults(defineProps<GlitchTextProps>(), {
  speed: 0.5,
  enableShadows: true,
  enableOnHover: false,
  lightTheme: false,
  className: '',
})

const inlineStyles = computed(
  (): CustomCSSProperties => ({
    '--after-duration': `${props.speed * 3}s`,
    '--before-duration': `${props.speed * 2}s`,
    '--after-shadow': props.enableShadows ? '-3px 0 red' : 'none',
    '--before-shadow': props.enableShadows ? '3px 0 cyan' : 'none',
  }),
)

function buildBaseClasses(light: boolean) {
  const text = light ? 'text-blue-700' : 'text-white'
  const beforeText = light ? 'before:text-blue-700' : 'before:text-white'
  const afterText = light ? 'after:text-blue-700' : 'after:text-white'
  const beforeBg = light ? 'before:bg-[#DBDBDB]' : 'before:bg-[#0b0b0b]'
  const afterBg = light ? 'after:bg-[#DBDBDB]' : 'after:bg-[#0b0b0b]'
  return [
    text,
    'font-black',
    'whitespace-nowrap',
    'relative',
    'mx-auto',
    'max-[899px]:mx-0',
    'select-none',
    'cursor-pointer',
    'text-[clamp(1.125rem,2.6vw,2.75rem)]',
    'max-[899px]:text-[clamp(0.9375rem,3.8vw,1.25rem)]',

    'before:content-[attr(data-text)]',
    'before:absolute',
    'before:top-0',
    beforeText,
    beforeBg,
    'before:overflow-hidden',
    'before:[clip-path:inset(0_0_0_0)]',

    'after:content-[attr(data-text)]',
    'after:absolute',
    'after:top-0',
    afterText,
    afterBg,
    'after:overflow-hidden',
    'after:[clip-path:inset(0_0_0_0)]',
  ]
}

const normalGlitchClasses = [
  'after:left-[6px]',
  'max-[899px]:after:left-[2px]',
  'after:[text-shadow:var(--after-shadow,-10px_0_red)]',
  'max-[899px]:after:[text-shadow:-1px_0_red]',
  'after:[animation:animate-glitch_var(--after-duration,3s)_infinite_linear_alternate-reverse]',

  'before:left-[-6px]',
  'max-[899px]:before:left-[-2px]',
  'before:[text-shadow:var(--before-shadow,10px_0_cyan)]',
  'max-[899px]:before:[text-shadow:1px_0_cyan]',
  'before:[animation:animate-glitch_var(--before-duration,2s)_infinite_linear_alternate-reverse]',
]

const hoverOnlyClasses = [
  'before:content-[""]',
  'before:opacity-0',
  'before:[animation:none]',
  'after:content-[""]',
  'after:opacity-0',
  'after:[animation:none]',

  'hover:before:content-[attr(data-text)]',
  'hover:before:opacity-100',
  'hover:before:left-[-6px]',
  'hover:before:[text-shadow:var(--before-shadow,10px_0_cyan)]',
  'hover:before:[animation:animate-glitch_var(--before-duration,2s)_infinite_linear_alternate-reverse]',

  'hover:after:content-[attr(data-text)]',
  'hover:after:opacity-100',
  'hover:after:left-[6px]',
  'hover:after:[text-shadow:var(--after-shadow,-10px_0_red)]',
  'hover:after:[animation:animate-glitch_var(--after-duration,3s)_infinite_linear_alternate-reverse]',
]

const computedClasses = computed(() => {
  const classes = [...buildBaseClasses(props.lightTheme)]

  if (props.enableOnHover) {
    classes.push(...hoverOnlyClasses)
    if (props.lightTheme) {
      classes.push(
        'hover:before:text-blue-700',
        'hover:after:text-blue-700',
        'hover:before:bg-[#DBDBDB]',
        'hover:after:bg-[#DBDBDB]',
      )
    }
  } else {
    classes.push(...normalGlitchClasses)
  }

  if (props.className) {
    classes.push(props.className)
  }

  return classes.join(' ')
})
</script>

<style>
@keyframes animate-glitch {
  0% {
    clip-path: inset(20% 0 50% 0);
  }
  5% {
    clip-path: inset(10% 0 60% 0);
  }
  10% {
    clip-path: inset(15% 0 55% 0);
  }
  15% {
    clip-path: inset(25% 0 35% 0);
  }
  20% {
    clip-path: inset(30% 0 40% 0);
  }
  25% {
    clip-path: inset(40% 0 20% 0);
  }
  30% {
    clip-path: inset(10% 0 60% 0);
  }
  35% {
    clip-path: inset(15% 0 55% 0);
  }
  40% {
    clip-path: inset(25% 0 35% 0);
  }
  45% {
    clip-path: inset(30% 0 40% 0);
  }
  50% {
    clip-path: inset(20% 0 50% 0);
  }
  55% {
    clip-path: inset(10% 0 60% 0);
  }
  60% {
    clip-path: inset(15% 0 55% 0);
  }
  65% {
    clip-path: inset(25% 0 35% 0);
  }
  70% {
    clip-path: inset(30% 0 40% 0);
  }
  75% {
    clip-path: inset(40% 0 20% 0);
  }
  80% {
    clip-path: inset(20% 0 50% 0);
  }
  85% {
    clip-path: inset(10% 0 60% 0);
  }
  90% {
    clip-path: inset(15% 0 55% 0);
  }
  95% {
    clip-path: inset(25% 0 15% 0);
  }
  100% {
    clip-path: inset(20% 0 0% 0);
  }
}
</style>


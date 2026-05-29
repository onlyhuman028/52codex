// .vitepress/config.mts
import { getSidebar } from "file:///Users/onlyhuman/Documents/Vibe%20coding/codex/52codex/node_modules/vitepress-plugin-auto-sidebar/dist/vitepress-plugin-auto-sidebar.js";
import { defineConfig } from "file:///Users/onlyhuman/Documents/Vibe%20coding/codex/52codex/node_modules/vitepress/dist/node/index.js";
var config_default = defineConfig({
  title: "\u6211\u7231CodeX",
  description: "\u975E\u7A0B\u5E8F\u5458\u7684 Codex \u5B9E\u6218\u7AD9\u3002\u4ECE\u7F16\u7A0B\u795E\u5668\u5230\u5168\u80FD\u52A9\u624B\u3002",
  lang: "zh-CN",
  cleanUrls: true,
  srcExclude: ["AGENTS.md", "DESIGN.md"],
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
    ["link", { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" }]
  ],
  markdown: {
    theme: {
      light: "github-light",
      dark: "github-dark"
    }
  },
  themeConfig: {
    sidebar: getSidebar({
      contentRoot: "/",
      // 文档根目录
      contentDirs: ["/"],
      // 扫描所有文件夹
      collapsible: true,
      // 分组可折叠
      collapsed: false
      // 默认展开
    })
  }
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLnZpdGVwcmVzcy9jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL29ubHlodW1hbi9Eb2N1bWVudHMvVmliZSBjb2RpbmcvY29kZXgvNTJjb2RleC8udml0ZXByZXNzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvb25seWh1bWFuL0RvY3VtZW50cy9WaWJlIGNvZGluZy9jb2RleC81MmNvZGV4Ly52aXRlcHJlc3MvY29uZmlnLm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvb25seWh1bWFuL0RvY3VtZW50cy9WaWJlJTIwY29kaW5nL2NvZGV4LzUyY29kZXgvLnZpdGVwcmVzcy9jb25maWcubXRzXCI7aW1wb3J0IHsgZ2V0U2lkZWJhciB9IGZyb20gJ3ZpdGVwcmVzcy1wbHVnaW4tYXV0by1zaWRlYmFyJ1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXByZXNzJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICB0aXRsZTogJ1x1NjIxMVx1NzIzMUNvZGVYJyxcbiAgZGVzY3JpcHRpb246ICdcdTk3NUVcdTdBMEJcdTVFOEZcdTU0NThcdTc2ODQgQ29kZXggXHU1QjlFXHU2MjE4XHU3QUQ5XHUzMDAyXHU0RUNFXHU3RjE2XHU3QTBCXHU3OTVFXHU1NjY4XHU1MjMwXHU1MTY4XHU4MEZEXHU1MkE5XHU2MjRCXHUzMDAyJyxcbiAgbGFuZzogJ3poLUNOJyxcbiAgY2xlYW5VcmxzOiB0cnVlLFxuICBzcmNFeGNsdWRlOiBbJ0FHRU5UUy5tZCcsICdERVNJR04ubWQnXSxcbiAgaGVhZDogW1xuICAgIFsnbGluaycsIHsgcmVsOiAnaWNvbicsIHR5cGU6ICdpbWFnZS9zdmcreG1sJywgaHJlZjogJy9mYXZpY29uLnN2ZycgfV0sXG4gICAgWydsaW5rJywgeyByZWw6ICdwcmVjb25uZWN0JywgaHJlZjogJ2h0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20nIH1dLFxuICAgIFsnbGluaycsIHsgcmVsOiAncHJlY29ubmVjdCcsIGhyZWY6ICdodHRwczovL2ZvbnRzLmdzdGF0aWMuY29tJywgY3Jvc3NvcmlnaW46ICcnIH1dLFxuICAgIFsnbGluaycsIHsgcmVsOiAnc3R5bGVzaGVldCcsIGhyZWY6ICdodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PUludGVyOndnaHRANDAwOzUwMDs2MDAmZGlzcGxheT1zd2FwJyB9XVxuICBdLFxuICBtYXJrZG93bjoge1xuICAgIHRoZW1lOiB7XG4gICAgICBsaWdodDogJ2dpdGh1Yi1saWdodCcsXG4gICAgICBkYXJrOiAnZ2l0aHViLWRhcmsnXG4gICAgfVxuICB9LFxuICB0aGVtZUNvbmZpZzoge1xuICAgIHNpZGViYXI6IGdldFNpZGViYXIoe1xuICAgICAgY29udGVudFJvb3Q6ICcvJywgICAgICAvLyBcdTY1ODdcdTY4NjNcdTY4MzlcdTc2RUVcdTVGNTVcbiAgICAgIGNvbnRlbnREaXJzOiBbJy8nXSwgICAgLy8gXHU2MjZCXHU2M0NGXHU2MjQwXHU2NzA5XHU2NTg3XHU0RUY2XHU1OTM5XG4gICAgICBjb2xsYXBzaWJsZTogdHJ1ZSwgICAgIC8vIFx1NTIwNlx1N0VDNFx1NTNFRlx1NjI5OFx1NTNFMFxuICAgICAgY29sbGFwc2VkOiBmYWxzZSAgICAgICAvLyBcdTlFRDhcdThCQTRcdTVDNTVcdTVGMDBcbiAgICB9KVxuICB9XG59KSJdLAogICJtYXBwaW5ncyI6ICI7QUFBeVcsU0FBUyxrQkFBa0I7QUFDcFksU0FBUyxvQkFBb0I7QUFFN0IsSUFBTyxpQkFBUSxhQUFhO0FBQUEsRUFDMUIsT0FBTztBQUFBLEVBQ1AsYUFBYTtBQUFBLEVBQ2IsTUFBTTtBQUFBLEVBQ04sV0FBVztBQUFBLEVBQ1gsWUFBWSxDQUFDLGFBQWEsV0FBVztBQUFBLEVBQ3JDLE1BQU07QUFBQSxJQUNKLENBQUMsUUFBUSxFQUFFLEtBQUssUUFBUSxNQUFNLGlCQUFpQixNQUFNLGVBQWUsQ0FBQztBQUFBLElBQ3JFLENBQUMsUUFBUSxFQUFFLEtBQUssY0FBYyxNQUFNLCtCQUErQixDQUFDO0FBQUEsSUFDcEUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxjQUFjLE1BQU0sNkJBQTZCLGFBQWEsR0FBRyxDQUFDO0FBQUEsSUFDbEYsQ0FBQyxRQUFRLEVBQUUsS0FBSyxjQUFjLE1BQU0sK0VBQStFLENBQUM7QUFBQSxFQUN0SDtBQUFBLEVBQ0EsVUFBVTtBQUFBLElBQ1IsT0FBTztBQUFBLE1BQ0wsT0FBTztBQUFBLE1BQ1AsTUFBTTtBQUFBLElBQ1I7QUFBQSxFQUNGO0FBQUEsRUFDQSxhQUFhO0FBQUEsSUFDWCxTQUFTLFdBQVc7QUFBQSxNQUNsQixhQUFhO0FBQUE7QUFBQSxNQUNiLGFBQWEsQ0FBQyxHQUFHO0FBQUE7QUFBQSxNQUNqQixhQUFhO0FBQUE7QUFBQSxNQUNiLFdBQVc7QUFBQTtBQUFBLElBQ2IsQ0FBQztBQUFBLEVBQ0g7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=

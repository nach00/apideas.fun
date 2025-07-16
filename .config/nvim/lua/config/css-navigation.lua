-- Enhanced CSS navigation helper for LazyVim
-- This provides better CSS class navigation for both regular CSS and CSS Modules

local M = {}

-- Function to find CSS file from className
function M.goto_css_definition()
  local word = vim.fn.expand("<cword>")
  local line = vim.api.nvim_get_current_line()
  
  print("Attempting CSS navigation for: " .. word)
  
  -- Get cursor position to understand context
  local cursor_col = vim.fn.col(".")
  local before_cursor = line:sub(1, cursor_col - 1)
  local after_cursor = line:sub(cursor_col)
  
  -- Try to find the imported CSS module file
  local bufnr = vim.api.nvim_get_current_buf()
  local lines = vim.api.nvim_buf_get_lines(bufnr, 0, -1, false)
  
  local css_file = nil
  local import_name = nil
  
  for _, import_line in ipairs(lines) do
    -- Match: import styles from './something.css' or '@/styles/...'
    local match_name, match_path = import_line:match('import%s+(%w+)%s+from%s+["\'](.+%.module%.css)["\']')
    if match_name and match_path then
      css_file = match_path
      import_name = match_name
      break
    end
    -- Also match regular CSS imports
    match_path = import_line:match('import%s+["\'](.+%.css)["\']')
    if match_path then
      css_file = match_path
      break
    end
  end
  
  if not css_file then
    print("No CSS import found in current file")
    return
  end
  
  -- Resolve path aliases
  local resolved_path = css_file
  if css_file:match("^@/") then
    resolved_path = css_file:gsub("^@/", "")
  elseif css_file:match("^%.%./") or css_file:match("^%./") then
    -- Handle relative paths
    local current_dir = vim.fn.expand("%:h")
    resolved_path = vim.fn.resolve(current_dir .. "/" .. css_file)
  end
  
  -- Try to open the CSS file
  local css_path = vim.fn.getcwd() .. "/" .. resolved_path
  if vim.fn.filereadable(css_path) == 1 then
    vim.cmd("edit " .. css_path)
    
    -- Search for the class definition
    local search_pattern = nil
    if import_name and before_cursor:match(import_name .. "%." .. word) then
      -- CSS Modules: convert camelCase to kebab-case if needed
      local css_class = word:gsub("(%l)(%u)", "%1-%2"):lower()
      search_pattern = "\\." .. css_class .. "\\s*{"
    else
      -- Regular CSS class
      search_pattern = "\\." .. word .. "\\s*{"
    end
    
    if search_pattern then
      local found = vim.fn.search(search_pattern, "w")
      if found == 0 then
        -- Try original word if kebab-case conversion didn't work
        vim.fn.search("\\." .. word .. "\\s*{", "w")
      end
    end
    
    print("Opened CSS file: " .. css_path)
  else
    print("CSS file not found: " .. css_path)
  end
end

-- Enhanced go to definition that tries LSP first, then CSS fallback
function M.enhanced_goto_definition()
  -- First, check if we have LSP clients that can handle definition
  local clients = vim.lsp.get_active_clients({ bufnr = 0 })
  local has_definition_provider = false
  
  for _, client in ipairs(clients) do
    if client.server_capabilities.definitionProvider then
      has_definition_provider = true
      break
    end
  end
  
  if has_definition_provider then
    -- Try LSP definition first
    local params = vim.lsp.util.make_position_params()
    
    vim.lsp.buf_request_all(0, "textDocument/definition", params, function(results)
      local valid_results = {}
      
      if results then
        for client_id, result in pairs(results) do
          if result.result and not vim.tbl_isempty(result.result) then
            table.insert(valid_results, result.result)
          end
        end
      end
      
      if not vim.tbl_isempty(valid_results) then
        -- LSP found definition, use it
        vim.lsp.util.jump_to_location(valid_results[1][1], "utf-8")
      else
        -- No LSP result, try CSS navigation
        print("No LSP definition found, trying CSS navigation...")
        M.goto_css_definition()
      end
    end)
  else
    -- No LSP definition provider, go straight to CSS navigation
    M.goto_css_definition()
  end
end

-- Set up enhanced keybindings
vim.keymap.set("n", "<leader>gd", M.enhanced_goto_definition, { desc = "Go to definition (CSS enhanced)" })
vim.keymap.set("n", "<leader>cd", M.goto_css_definition, { desc = "Go to CSS definition" })

-- Override default gd in TypeScript/JavaScript files for CSS navigation
vim.api.nvim_create_autocmd("FileType", {
  pattern = { "typescript", "typescriptreact", "javascript", "javascriptreact" },
  callback = function()
    vim.keymap.set("n", "gd", M.enhanced_goto_definition, { 
      buffer = true, 
      desc = "Go to definition (CSS enhanced)" 
    })
  end,
})

return M
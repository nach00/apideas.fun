-- LSP restart and reload helper for debugging CSS navigation

local M = {}

function M.restart_lsp()
  -- Stop all LSP clients
  vim.lsp.stop_client(vim.lsp.get_active_clients())
  
  -- Wait a moment
  vim.defer_fn(function()
    -- Reload the buffer to restart LSP
    vim.cmd("edit!")
    print("LSP clients restarted")
  end, 1000)
end

function M.show_lsp_info()
  print("=== Active LSP Clients ===")
  local clients = vim.lsp.get_active_clients({ bufnr = 0 })
  
  for _, client in ipairs(clients) do
    print(string.format("- %s (id: %d)", client.name, client.id))
    if client.server_capabilities.definitionProvider then
      print("  ✓ Supports go-to-definition")
    else
      print("  ✗ No go-to-definition support")
    end
  end
  
  if #clients == 0 then
    print("No LSP clients attached to current buffer")
  end
end

function M.test_css_navigation()
  local word = vim.fn.expand("<cword>")
  local line = vim.api.nvim_get_current_line()
  
  print("=== CSS Navigation Test ===")
  print("Word under cursor: " .. word)
  print("Current line: " .. line)
  
  -- Check for CSS imports
  local bufnr = vim.api.nvim_get_current_buf()
  local lines = vim.api.nvim_buf_get_lines(bufnr, 0, -1, false)
  
  print("CSS imports found:")
  for i, import_line in ipairs(lines) do
    if import_line:match("import.*%.css") then
      print(string.format("  Line %d: %s", i, import_line))
    end
  end
end

-- Set up keybindings for debugging
vim.keymap.set("n", "<leader>lr", M.restart_lsp, { desc = "Restart LSP" })
vim.keymap.set("n", "<leader>li", M.show_lsp_info, { desc = "Show LSP info" })
vim.keymap.set("n", "<leader>ct", M.test_css_navigation, { desc = "Test CSS navigation" })

return M
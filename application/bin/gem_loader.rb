if ARGV.first != "custom"
	ENV["GEM_PATH"] = ENV["GEM_HOME"] = ARGV.first
end

Encoding.default_external = 'UTF-8'

ARGV.shift

gem_to_load = ARGV.first
gem_cmd = (gem_to_load == "slim" ? 'slimrb': gem_to_load)

ARGV.shift

require 'rubygems'
load Gem.bin_path(gem_to_load, gem_cmd, ">= 0")

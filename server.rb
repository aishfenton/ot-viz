require 'sinatra'
require "sinatra/reloader" if development?
require "./sim_res"
require "json"
require "sinatra/json"

get '/' do
  redirect '/index.html'
end

get '/res.json' do
  @sim_res ||= SimRes.new(10, 0.1)
  json(@sim_res.step)
end

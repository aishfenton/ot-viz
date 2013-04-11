require 'sinatra'
require 'open-uri'

FEED_URL = "http://feeds-{REGION}.otcorp.opentable.com/reservations/created/"

get '/' do
  redirect '/index.html'
end

#get '/res-sim.json' do
  #@sim_res ||= SimRes.new(1000, 0.1)
  #json(@sim_res.step)
#end

get '/res/:region.json' do |region|
  #headers("Access-Control-Allow-Origin" => "*")
  url = FEED_URL.gsub("{REGION}", region)
  URI.parse(url).read
end


require "micro_agent"

class SimRes

  COUNTRIES = {
    america: [[49.38, -66.94], [25.82, -124.39]],
    england: [[55.8111127, 1.7629159], [49.8647517, -6.4177822]],
  }
  
  def initialize(number_of_agents, percent_per_cycle) 
    @world = Micro::World.new(0, number_of_agents, percent_per_cycle) do |i|
      Micro::MarkovAgent.new(
        
        :t => Micro::Parameter.new do |p|
          p.start_value = 0
          p.change_func = lambda { |value| (value + 1) }
        end,

        :no_of_res => Micro::Parameter.new do |p|
          x = rand
          p.start_value = [0.01, Math::E**(100*x - 100)].max
          p.change_func = lambda { |value| rand * 10 }
        end,

        :lat_lng => Micro::Parameter.new do |p|
          country = COUNTRIES.keys.sample
          p.start_value = random_point_in_rect(*COUNTRIES[country])
        end

      )
    end
  end

  def random_point_in_rect(ne, sw)
    lat = sw[0] + (rand * (ne[0] - sw[0]))
    lng = sw[1] + (rand * (ne[1] - sw[1])) 
    [lat,lng]
  end

  def step
    @world.step_agents
    as_json 
  end

  private

  def as_json(*)
    r = @world.agents.map do |a|
      { latitude:  a[:lat_lng][0], longitude: a[:lat_lng][1], partysize: a[:no_of_res] }
    end
    { reservations: r }
  end

end



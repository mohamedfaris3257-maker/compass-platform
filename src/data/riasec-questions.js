export const riasecQuestions = [
  {id:'R1', theme:'R', text:"Working with my hands to build or fix things gives me a sense of accomplishment.", reverse:false},
  {id:'R2', theme:'R', text:"I feel most focused when I'm solving practical, hands-on problems.", reverse:false},
  {id:'R3', theme:'R', text:"I would get restless if my work required me to use tools or equipment all day.", reverse:true},
  {id:'R4', theme:'R', text:"I enjoy figuring out how mechanical or technical things work.", reverse:false},
  {id:'R5', theme:'R', text:"Being outdoors and physically active energizes me more than sitting at a desk.", reverse:false},
  {id:'I1', theme:'I', text:"I feel excited when I discover the why behind how something works.", reverse:false},
  {id:'I2', theme:'I', text:"Analyzing data or information to find patterns is genuinely interesting to me.", reverse:false},
  {id:'I3', theme:'I', text:"I would enjoy a challenge that requires deep thinking and research.", reverse:false},
  {id:'I4', theme:'I', text:"I lose interest quickly when tasks require a lot of reading or studying.", reverse:true},
  {id:'I5', theme:'I', text:"It's satisfying to solve complex problems even if there's no immediate reward.", reverse:false},
  {id:'A1', theme:'A', text:"I feel most alive when I'm creating something original or expressing my ideas.", reverse:false},
  {id:'A2', theme:'A', text:"Coming up with new and creative solutions energizes me.", reverse:false},
  {id:'A3', theme:'A', text:"Following traditional ways of doing things appeals to me more than experimenting.", reverse:true},
  {id:'A4', theme:'A', text:"I enjoy work that lets me use my imagination freely.", reverse:false},
  {id:'A5', theme:'A', text:"It's important to me that my work allows for personal creative expression.", reverse:false},
  {id:'S1', theme:'S', text:"Helping others solve their problems gives me genuine satisfaction.", reverse:false},
  {id:'S2', theme:'S', text:"I feel energized when working as part of a team toward a common goal.", reverse:false},
  {id:'S3', theme:'S', text:"Teaching or explaining things to others comes naturally to me.", reverse:false},
  {id:'S4', theme:'S', text:"I prefer working independently rather than supporting or helping others.", reverse:true},
  {id:'S5', theme:'S', text:"Making a positive difference in someone's life feels more rewarding than personal achievement.", reverse:false},
  {id:'E1', theme:'E', text:"I feel confident taking charge when a group needs direction.", reverse:false},
  {id:'E2', theme:'E', text:"Convincing others to see things from my perspective is something I enjoy.", reverse:false},
  {id:'E3', theme:'E', text:"I would rather follow someone else's plan than create and lead my own.", reverse:true},
  {id:'E4', theme:'E', text:"Starting new projects or initiatives excites me more than maintaining existing ones.", reverse:false},
  {id:'E5', theme:'E', text:"I'm energized by opportunities to compete or prove myself.", reverse:false},
  {id:'C1', theme:'C', text:"Organizing information or materials into clear systems is satisfying to me.", reverse:false},
  {id:'C2', theme:'C', text:"I feel accomplished when I complete tasks accurately and thoroughly.", reverse:false},
  {id:'C3', theme:'C', text:"Following established procedures helps me feel more confident in my work.", reverse:false},
  {id:'C4', theme:'C', text:"I get bored quickly when tasks require attention to small details.", reverse:true},
  {id:'C5', theme:'C', text:"Keeping accurate records and tracking information appeals to me.", reverse:false},
]

export const riasecScale = ['Strongly Disagree','Disagree','Neutral','Agree','Strongly Agree']

export const themeNames = {
  R: 'Realistic',
  I: 'Investigative',
  A: 'Artistic',
  S: 'Social',
  E: 'Enterprising',
  C: 'Conventional',
}

export const themeDescriptions = {
  R: 'Hands-on, practical, and technical work',
  I: 'Research, analysis, and problem-solving',
  A: 'Creative expression and imagination',
  S: 'Helping, teaching, and supporting others',
  E: 'Leading, persuading, and entrepreneurship',
  C: 'Organization, detail, and structure',
}

  {/* <Testimonial
            content={testimonials[currentIndex].content}
            author={testimonials[currentIndex].author}
            position={testimonials[currentIndex].position}
            image={testimonials[currentIndex].image}
          />

          <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 hidden md:block">
            <button 
              onClick={prevTestimonial}
              className="bg-white text-blue-600 hover:text-blue-800 p-2 rounded-full shadow-md focus:outline-none transform transition hover:scale-110"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>
          </div>

          <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 hidden md:block">
            <button 
              onClick={nextTestimonial}
              className="bg-white text-blue-600 hover:text-blue-800 p-2 rounded-full shadow-md focus:outline-none transform transition hover:scale-110"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="flex justify-center mt-8 md:hidden">
            <button 
              onClick={prevTestimonial}
              className="bg-white text-blue-600 hover:text-blue-800 p-2 mx-2 rounded-full shadow-md focus:outline-none"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={nextTestimonial}
              className="bg-white text-blue-600 hover:text-blue-800 p-2 mx-2 rounded-full shadow-md focus:outline-none"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="flex justify-center mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 w-3 mx-1 rounded-full ${index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div> */}
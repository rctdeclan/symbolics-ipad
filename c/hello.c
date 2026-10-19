#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <mlx.h>

#define WINDOW_WIDTH 1280
#define WINDOW_HEIGHT 720

typedef struct s_img
{
    void	*mlx_img;
    char	*addr;
    int		bpp; /* bits per pixel */
    int		line_len;
    int		endian;
}	t_img;

typedef struct    data_s
{
    void          *mlx_ptr;
    void          *mlx_win;
    t_img	img;
}                 data_t;


int	render(data_t *data)
{
    /* if window has been destroyed, we don't want to put the pixel ! */
    if (data->mlx_win != NULL)
        img_pix_put(&data->img->mxl_image, WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 0xFF00);
    return (0); 
}

void	img_pix_put(t_img *img, int x, int y, int color)
{
    char    *pixel;

    pixel = img->addr + (y * img->line_len + x * (img->bpp / 8));
    *(int *)pixel = color;
}



int main(void)
{
    data_t        data;

    if ((data.mlx_ptr = mlx_init()) == NULL)
        return (EXIT_FAILURE);
    if ((data.mlx_win = mlx_new_window(data.mlx_ptr, WINDOW_WIDTH, WINDOW_HEIGHT, "Symbolics")) == NULL)
        return (EXIT_FAILURE);

    data.img.mlx_img = mlx_new_image(data.mlx_ptr, WINDOW_WIDTH, WINDOW_HEIGHT);

    mlx_loop_hook(data.mlx_ptr,&render,&data);
    mlx_loop(data.mlx_ptr);

    //mlx_destroy_display(data.mlx_ptr);
    free(data.mlx_ptr);

    return (EXIT_SUCCESS);
}



//https://aurelienbrabant.fr/blog/pixel-drawing-with-the-minilibx
//https://blend2d.com/
//https://github.com/wwatkins42/42_C_Projects/tree/master


// https://github.com/codam-coding-college

//https://github.com/agavrel/42_CheatSheet#0x00--what-is-42-school

//https://github.com/S-LucasSerrano/miniLibX_sample

//https://pulgamecanica.herokuapp.com/posts/mlx-animations

//    gcc -I /usr/X11/include -g -L /usr/X11/lib -l mlx -framework OpenGL -framework AppKit test.c


